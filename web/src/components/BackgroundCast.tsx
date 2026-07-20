// Decorative background art: a handful of Palworld's anthropomorphic Pals, faded into
// the corners behind the glass UI. Images are hotlinked from the Palworld Fandom wiki's
// CDN (same source/license as the pal icons used throughout the app — see README).
const CAST = [
  { name: 'Katress', image: 'https://static.wikia.nocookie.net/palworld/images/8/8d/Katress.png', corner: 'tl' },
  { name: 'Paladius', image: 'https://static.wikia.nocookie.net/palworld/images/b/b8/Paladius.png', corner: 'tr' },
  { name: 'Warsect', image: 'https://static.wikia.nocookie.net/palworld/images/3/3a/Warsect.png', corner: 'bl' },
  { name: 'Wixen', image: 'https://static.wikia.nocookie.net/palworld/images/f/fd/Wixen.png', corner: 'br' },
] as const;

export function BackgroundCast() {
  return (
    <>
      {CAST.map((c) => (
        <img
          key={c.name}
          className={`bg-character bg-character-${c.corner}`}
          src={c.image}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ))}
    </>
  );
}
