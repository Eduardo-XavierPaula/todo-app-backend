import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'todos' })
export class TodoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  task: string;
  @Column({ name: 'is_done', type: 'tinyint', width: 1 })
  isDone: number;
  @CreateDateColumn({ name: 'createdAt' })
  createdAt: string;
  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: string;
  @DeleteDateColumn({ name: 'deletedAt' })
  deletedAt: string;
}
