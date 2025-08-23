import { DonateButton } from "./DonateButton";
import { useChildContext } from "../contexts/ChildContext";

export const ChildInfo: React.FC = () => {
  const { child } = useChildContext();
  if (!child) return;

  return(
    <div className="relative flex gap-20 h-dvh w-full">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="https://reach.org.hk/_assets/video/436f7419b8ea8afe3ddc521715b019f6.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black opacity-50 z-10"/>
      <div className="flex flex-col items-center justify-center gap-8 z-20 w-full">
        <div className="flex flex-col gap-1 w-full jusify-center items-center">
          <h1 className="text-4xl font-extrabold text-white">Meet {child.name}</h1>
          <p className="text-md text-white">{child.description}</p>
        </div>
        <div className="flex items-center justify-center w-full">
          <DonateButton/>
        </div>
      </div>
    </div>
  );
}
