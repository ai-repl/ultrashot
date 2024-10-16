export function decodeBase64Image(dataString: string) {
  const matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

  return {
    type: matches?.[1],
    data: matches?.[2],
  };
}

export const ImageSize = [
  { name: "1:1", label: "1:1", value: "1:1" },
  { name: "16:9", label: "16:9", value: "16:9" },
  { name: "9:16", label: "9:16", value: "9:16" },
  { name: "21:9", label: "21:9", value: "21:9" },
  { name: "9:21", label: "9:21", value: "9:21" },
  { name: "4:3", label: "4:3", value: "4:3" },
  { name: "3:4", label: "3:4", value: "3:4" },
  { name: "2:3", label: "2:3", value: "2:3" },
  { name: "3:2", label: "3:2", value: "3:2" },
  { name: "2:1", label: "2:1", value: "2:1" },
  { name: "1:2", label: "1:2", value: "1:2" },
];

const getClosestRatio = (img: HTMLImageElement) => {
  return ImageSize.reduce(
    (closest, current) => {
      const [currentWidth, currentHeight] = current.value
        .split(":")
        .map(Number);
      const currentRatio = currentWidth / currentHeight;
      const imgRatio = img.width / img.height;
      const currentDiff = Math.abs(currentRatio - imgRatio);
      const closestDiff = Math.abs(closest.ratio - imgRatio);
      return currentDiff < closestDiff
        ? { value: current.value, ratio: currentRatio }
        : closest;
    },
    {
      value: ImageSize[0].value,
      ratio:
        Number(ImageSize[0].value.split(":")[0]) /
        Number(ImageSize[0].value.split(":")[1]),
    }
  );
};

export const getImageAspectRatio = async (
  file: File | Blob
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");
    img.onload = () => {
      const closestRatio = getClosestRatio(img);
      resolve(closestRatio.value);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};
