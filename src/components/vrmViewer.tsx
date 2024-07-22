import { useCallback, useContext } from "react";
import { ViewerContext } from "../features/vrmViewer/viewerContext";
import { buildUrl } from "../utils/buildUrl";

type Props = {
  selectType: string;
};

export default function VrmViewer({ selectType }: Props) {
  const { viewer } = useContext(ViewerContext);

  const canvasRef = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (canvas) {
        viewer.setup(canvas);
        switch (selectType) {
          case "male":
            viewer.loadVrm(buildUrl("/AvatarSample_A.vrm"));
            break;
          case "dog":
            viewer.loadVrm(buildUrl("/AvatarSample_C.vrm"));
            break;
          default:
            viewer.loadVrm(buildUrl("/AvatarSample_B.vrm"));
            break;
        }

        canvas.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        canvas.addEventListener("drop", function (event) {
          event.preventDefault();

          const files = event.dataTransfer?.files;
          if (!files) {
            return;
          }

          const file = files[0];
          if (!file) {
            return;
          }

          const file_type = file.name.split(".").pop();
          if (file_type === "vrm") {
            const blob = new Blob([file], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            viewer.loadVrm(url);
          }
        });
      }
    },
    [viewer, selectType]
  );

  return (
    <div className={"absolute top-0 left-0 w-screen h-[100svh]"}>
      <canvas ref={canvasRef} className={"h-full w-full"}></canvas>
    </div>
  );
}