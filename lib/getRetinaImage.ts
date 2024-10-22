import domtoimage from "dom-to-image";

const getRetinaImage = async (node: HTMLElement) => {
  const SCALE = 2;
  // const scale = 750 / node.offsetWidth

  let imageBlob: Blob | null = null;

  const retinaOption = {
    quality: 1,
    height: node.offsetHeight * SCALE,
    width: node.offsetWidth * SCALE,
    style: {
      transform: `scale(${SCALE}) translate(${
        node.offsetWidth / 2 / SCALE
      }px, ${node.offsetHeight / 2 / SCALE}px)`,
    },
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
