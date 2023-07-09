export interface NFT {
  name: string;
  image: string;
  attributes: { trait_type: string; value: string }[];
  navigation: {
    next: string;
    prev: string;
  };
}

export interface Blur {
  data: {
    code: string;
    x: number;
    y: number;
  };
}

// export interface GodList {
//   total: number;
//   length: number;
//   data: God[];
//   next: null | string;
// }

// export interface GodComplex {
//   name: string;
//   media: {
//     uri: string;
//     blurhash: string;
//   };
//   description: {
//     role: string;
//     lore: string;
//   };
//   metadata: { name: string; value: string }[];
//   navigation: {
//     prev: string;
//     next: string;
//   };
//   external_links: {
//     souffl3: string;
//     topaz: string;
//   };
// }
