import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ToggleApproveCommentDto } from './dto/approve-comment.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { Role } from 'src/users/entities/role.enum';
import { Roles } from 'src/users/entities/roles.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';

export class Comment {
  content: string;
  parentId?: number;
}
@UseGuards(JwtAuthGuard)
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Roles([Role.USER])
  @Post()
  create(@Body() body: CreateCommentDto, @Req() request) {
    return this.commentService.create({
      content: body.content,
      parentId: body.parentId,
      userId: request.user.userId,
    });
  }

  @Roles([Role.USER, Role.ADMIN])
  @Get()
  findAll(@Req() request) {
    if (request.user.role === Role.ADMIN) {
      return this.commentService.findAll();
    } else {
      return this.commentService.findApproved();
    }
  }

  @Roles([Role.USER])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() request,
  ) {
    return this.commentService.update({
      id: +id,
      attrs: updateCommentDto,
      userId: request.user.userId,
    });
  }

  @Roles([Role.ADMIN])
  @Patch('toggleApprove/:id')
  toggleApprove(
    @Param('id') id: string,
    @Body() toggleApproveDto: ToggleApproveCommentDto,
  ) {
    return this.commentService.toggleApprove(+id, toggleApproveDto);
  }

  @Roles([Role.USER, Role.ADMIN])
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request) {
    return this.commentService.remove({
      id: +id,
      userId: request.user.role === Role.USER ? request.user.userId : undefined,
    });
  }
}
