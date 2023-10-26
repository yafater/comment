import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleApproveCommentDto {
  @IsBoolean()
  @IsNotEmpty()
  isApproved: boolean;
}
