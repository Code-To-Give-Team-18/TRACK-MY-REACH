import { useRouter } from "next/navigation";
import { FollowButton, FollowStatus } from "./FollowButton";

export interface Post {
  id: string;
  child_id: string;
  child_name: string;
  author_id: string;
  author_name: string;
  title: string;
  caption: string;
  comments: string;
  post_type: string;
  media_urls: string[];
  video_link: string;
  likes: number;
  comments_count: number;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({
  post
}) => {

  const router = useRouter();

  const redirectToChildPage = (childId: string) => {
    router.push(`/child?id=${childId}`);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center">
        <video 
          className="w-[400px] h-[600px] object-cover"
          style={{ borderRadius: "12px" }}  
          src={post.video_link} width="500" height="500" autoPlay muted loop
        />
      </div>
      <div className="flex flex-col gap-1">
        <p>{post.title}</p>
        <div className="flex flex-row gap-3">
          <button 
            className="text-xl font-semibold cursor-pointer"
            onClick={() => redirectToChildPage(post.child_id)}
          >
            {post.child_name}
          </button>
          <FollowButton status={FollowStatus.NOT_FOLLOWING} />
        </div>
        <p>{post.caption}</p>
        <div className="flex flex-row gap-3">
          <p>{post.likes} Likes</p>
          <button>Like</button>
        </div>
      </div>
    </div>
  );
}
