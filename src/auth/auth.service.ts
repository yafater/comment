import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import RefreshToken from './entities/refresh-token.entity';
import { User } from 'src/users/entities/user.entity';
import { sign, verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  private refreshTokens: RefreshToken[] = [];

  async login(
    username: string,
    password: string,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string } | undefined> {
    const user = await this.usersService.findOne(username);
    if (!user) {
      return undefined;
    }
    if (user.password !== password) {
      return undefined;
    }

    return this.newRefreshAndAccessToken(user, values);
  }

  async refresh(refreshStr: string): Promise<string | undefined> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);
    if (!refreshToken) {
      return undefined;
    }

    const user = await this.usersService.findOneById(refreshToken.userId);
    if (!user) {
      return undefined;
    }

    const accessToken = {
      userId: refreshToken.userId,
      role: user.role,
    };

    return sign(accessToken, process.env.ACCESS_SECRET, { expiresIn: '1h' });
  }

  private retrieveRefreshToken(
    refreshStr: string,
  ): Promise<RefreshToken | undefined> {
    try {
      const decoded = verify(refreshStr, process.env.REFRESH_SECRET);
      if (typeof decoded === 'string') {
        return undefined;
      }
      return Promise.resolve(
        this.refreshTokens.find((token) => token.id === decoded.id),
      );
    } catch (e) {
      return undefined;
    }
  }

  async logout(refreshStr): Promise<void> {
    const refreshToken = await this.retrieveRefreshToken(refreshStr);

    if (!refreshToken) {
      return;
    }
    this.refreshTokens = this.refreshTokens.filter(
      (refreshToken) => refreshToken.id !== refreshToken.id,
    );
  }

  private async newRefreshAndAccessToken(
    user: User,
    values: { userAgent: string; ipAddress: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshObject = new RefreshToken({
      id:
        this.refreshTokens.length === 0
          ? 0
          : this.refreshTokens[this.refreshTokens.length - 1].id + 1,
      ...values,
      userId: user.id,
    });
    this.refreshTokens.push(refreshObject);

    return {
      refreshToken: refreshObject.sign(),
      accessToken: sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.ACCESS_SECRET,
        {
          expiresIn: '1h',
        },
      ),
    };
  }
}
