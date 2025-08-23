import { FollowButton, FollowStatus } from "./FollowButton";

export interface Post {
  id: number; // PostId
  name: string;
  description?: string;
  pictureLink?: string;
  isFollowing: boolean;
};

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({
  post
}) => {
  return (
    <div>
      <p>{post.name}</p>
      {post.pictureLink && <img src={post.pictureLink}/>}
      <p>{post.description}</p>
      <FollowButton status={post.isFollowing ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING}/>
    </div>
  );
}
