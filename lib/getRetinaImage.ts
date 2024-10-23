import domtoimage from "dom-to-image";

const getRetinaImage = async (node: HTMLElement, scale: number = 2) => {
  let imageBlob: Blob | null = null;

  const retinaOption = {
    quality: 1,
    height: node.offsetHeight * scale,
    width: node.offsetWidth * scale,
    cacheBust: true,
  };

  try {
    imageBlob = await domtoimage.toBlob(node, retinaOption);
  } catch (error) {
    console.error("oops, something went wrong!", error);
  }

  return {
    imageBlob,
  };
};

export default getRetinaImage;
