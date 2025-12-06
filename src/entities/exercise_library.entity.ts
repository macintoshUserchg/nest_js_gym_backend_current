import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('exercise_library')
export class ExerciseLibrary {
  @PrimaryGeneratedColumn('uuid')
  exercise_id: string;

  @Column({ length: 100 })
  exercise_name: string;

  @Column({
    type: 'enum',
    enum: ['upper_body', 'lower_body', 'core', 'cardio', 'full_body'],
  })
  body_part: string;

  @Column({
    type: 'enum',
    enum: ['strength', 'cardio', 'flexibility', 'endurance', 'general'],
  })
  exercise_type: string;

  @Column({ type: 'enum', enum: ['beginner', 'intermediate', 'advanced'] })
  difficulty_level: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  instructions?: string;

  @Column({ type: 'text', nullable: true })
  benefits?: string;

  @Column({ type: 'text', nullable: true })
  precautions?: string;

  @Column({ type: 'text', nullable: true })
  video_url?: string;

  @Column({ type: 'text', nullable: true })
  image_url?: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
