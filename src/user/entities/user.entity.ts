import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { hash } from 'bcrypt';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ default: '' })
  image: string;

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
