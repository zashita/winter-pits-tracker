import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class WinterPit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float', { array: true })
  starts: number[];

  @Column('float', { array: true, nullable: true })
  ends?: number[];

  @Column('float')
  square: number;

  @Column('text')
  description: string;
}
