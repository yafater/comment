import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ToggleApproveCommentDto } from './dto/approve-comment.dto';

@Injectable()
export class CommentService {
  constructor(@InjectRepository(Comment) private repo: Repository<Comment>) {}

  create(createCommentDto: CreateCommentDto) {
    const comment = this.repo.create(createCommentDto);
    return this.repo.save(comment);
  }

  findAll() {
    return this.repo.find();
  }

  findApproved() {
    return this.repo.find({ where: { isApproved: true } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async toggleApprove(id: number, attrs: ToggleApproveCommentDto) {
    const comment = await this.findOne(id);
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    Object.assign(comment, attrs);
    return this.repo.save(comment);
  }

  async update(dto: { id: number; attrs: UpdateCommentDto; userId: number }) {
    const comment = await this.findOne(dto.id);
    if (!comment || (dto.userId && dto.userId !== comment.userId)) {
      throw new NotFoundException('comment not found');
    }
    Object.assign(comment, { ...dto.attrs, isApproved: false });
    return this.repo.save(comment);
  }

  async remove(dto: { id: number; userId: number }) {
    const comment = await this.findOne(dto.id);
    if (!comment || (dto.userId && dto.userId !== comment.userId)) {
      throw new NotFoundException('comment not found');
    }
    return this.repo.remove(comment);
  }
}
