import { Particles } from 'react-animated-layouts';

export function SiteBackground({ theme }: { theme: string }) {
  return (
    <div className="site-bg" aria-hidden="true">
      <Particles
        key={theme}
        height="100%"
        shape="square"
        count={120}
        size={[1, 3]}
        colors={['#f472b6', '#fb7185']}
        speed={1}
        links
        linkDistance={90}
        linkWidth={1}
        linkOpacity={0.35}
        interaction="attract"
        pointerTarget="window"
        interactionRadius={140}
        depth={0}
        background={theme === 'dark' ? '#12091a' : undefined}
        seed={1}
      />
    </div>
  );
}
