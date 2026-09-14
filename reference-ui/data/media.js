/** Shared shop media. Click-through gallery on the provider page. */
const SHOP_MEDIA = {
  video: {
    type: 'video',
    src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    caption: 'Shop walkthrough',
  },
  stills: [
    { type: 'image', src: 'https://images.unsplash.com/photo-1487754180451-c456f719a1f8?auto=format&fit=crop&w=1200&q=80', caption: 'Bay one, morning' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80', caption: 'Lift and alignment rack' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=80', caption: 'Finished job, driveway' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', caption: 'Waiting lane' },
    { type: 'image', src: 'https://images.unsplash.com/photo-1632823471565-1ecdf5c6da5e?auto=format&fit=crop&w=1200&q=80', caption: 'Parts shelf' },
  ],
};

export function shopGallery() {
  return [SHOP_MEDIA.video, ...SHOP_MEDIA.stills];
}
