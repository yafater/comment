import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  parentId?: number;

  @Column()
  userId: number;

  @Column()
  content: string;

  @Column({ default: false, nullable: false })
  isApproved: boolean;

  @ManyToOne(() => Comment, (category) => category.comments)
  parent: Comment;

  @OneToMany(() => Comment, (category) => category.parent)
  comments: Comment[];
}
