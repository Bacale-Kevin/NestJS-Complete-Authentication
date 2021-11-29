import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { hash } from 'bcrypt';

export type Status = 'active' | 'pending';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: '' })
  image: string;

  @Column({ nullable: true, name: 'refreshtoken' })
  refreshToken: string;

  @Column({ type: 'date', nullable: true, name: 'refreshtokenexp' })
  refreshTokenExp: string;

  @Column({ unique: true, name: 'confirmationcode', nullable: true })
  confirmationCode: string;

  @Column({
    type: 'enum',
    enum: ['active', 'pending'],
    default: 'pending',
  })
  status: Status;

  @BeforeInsert()
  async hashPassword() {
    this.password = await hash(this.password, 10);
  }

  // @OneToMany(() => ArticleEntity, (article) => article.author)
  // articles: ArticleEntity[];

  /** Many use can favorite a post and a post can have multiple users who marks it as favorite */
  // @ManyToMany(() => ArticleEntity)
  // @JoinTable()
  // favorites: ArticleEntity[];
}
