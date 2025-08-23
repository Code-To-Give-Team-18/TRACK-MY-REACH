import Image from "next/image";
import { DonateButton } from "./DonateButton";
import { useChildContext } from "../contexts/ChildContext";

export const ChildInfo: React.FC = () => {
  const { child } = useChildContext();
  if (!child) return;

  return(
    <div className="flex gap-20 h-dvh">
      <div className="flex justify-center items-center">
        <Image
          src="https://static.wikia.nocookie.net/no-game-no-life/images/d/dc/Shiro_Anime_HQ.png/revision/latest?cb=20210523001016"
          alt="no game no life"
          width={300}
          height={400}
        />
      </div>
      <div className="flex flex-col items-start justify-center gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold">{child.name}</h1>
          <p className="text-md">{child.description}</p>
        </div>
        <div className="flex items-center justify-center w-full">
          <DonateButton/>
        </div>
      </div>
    </div>
  );
}
