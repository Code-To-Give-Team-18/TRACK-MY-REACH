import { useRouter } from "next/navigation";
import { FollowButton, FollowStatus } from "./FollowButton";
import { getBackendUrl } from '@/utils/url.utils';

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
  youtube_url: string;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  follow_status: boolean | null;
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
    <div className="flex flex-col gap-2 justify-center items-center snap-center w-full min-h-dvh" style={{
      height: "calc(100dvh - 80px)"
    }}>
      <div className="flex justify-center">
        <video 
          className="object-cover"
          style={{ 
            borderRadius: "12px",
            height: "80vh",
            aspectRatio: "9/16",
            maxWidth: "100%"
          }}  
          src={post.video_link ? getBackendUrl(post.video_link) : ''} autoPlay muted loop 
          // controls
        />
      </div>
      <div className="flex flex-col gap-1 justify-center w-[500px]">
        <p>{post.title}</p>
        <div className="flex flex-row gap-3">
          <button 
            className="text-xl font-semibold cursor-pointer"
            onClick={() => redirectToChildPage(post.child_id)}
          >
            {post.child_name}
          </button>
          <FollowButton status={post.follow_status ? FollowStatus.FOLLOWING : FollowStatus.NOT_FOLLOWING} childId={post.child_id}/>
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
