import type { Meta, StoryObj } from '@storybook/react-vite';
import { Particles, type ParticlesProps } from './Particles';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const Label = ({ children, color = '#fff' }: { children: string; color?: string }) => (
  <div style={{ display: 'grid', placeItems: 'center', height: '100%', color, font: '600 28px/1.2 system-ui, sans-serif' }}>{children}</div>
);

const meta = {
  title: 'Layouts/Particles',
  component: Particles,
  parameters: { layout: 'fullscreen' },
  args: {
    count: 90,
    colors: ['#94a3b8', '#7dd3fc', '#c4b5fd'],
    size: [1, 3],
    speed: 1,
    linkDistance: 120,
    linkWidth: 1,
    linkOpacity: 0.35,
    links: true,
    interaction: 'repel',
    interactionRadius: 140,
    depth: 0,
    shape: 'circle',
    background: '#0b1020',
    seed: 1,
    height: 420,
    width: '100%',
  },
  argTypes: {
    count: range(0, 600, 10),
    colors: { control: 'object' },
    size: { control: 'object' },
    speed: range(-4, 4, 0.1),
    linkDistance: range(0, 300, 5),
    linkWidth: range(0, 4, 0.25),
    linkOpacity: range(0, 1, 0.05),
    links: { control: 'boolean' },
    interaction: { control: 'inline-radio', options: ['none', 'repel', 'attract'] },
    interactionRadius: range(20, 400, 10),
    depth: range(0, 1, 0.05),
    direction: range(0, 360, 5),
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
    background: { control: 'color' },
    seed: range(0, 99),
    height: range(200, 800, 10),
    width: { control: 'text' },
    className: { control: 'text' },
    style: { control: 'object' },
    children: { control: false },
  },
  render: (args: ParticlesProps) => (
    <Particles {...args}>
      <Label>Particles</Label>
    </Particles>
  ),
} satisfies Meta<typeof Particles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Network: Story = {};

export const Snow: Story = {
  args: {
    count: 160,
    colors: ['#ffffff', '#dbeafe'],
    size: [1, 4],
    speed: 0.8,
    links: false,
    interaction: 'none',
    depth: 0.8,
    direction: 100,
    background: '#0f1b2d',
    seed: 4,
  },
};

export const Constellation: Story = {
  args: {
    count: 70,
    colors: ['#fde68a', '#fef3c7'],
    size: [1, 2.5],
    speed: 0.35,
    linkDistance: 150,
    linkOpacity: 0.5,
    interaction: 'attract',
    interactionRadius: 200,
    depth: 0.5,
    background: '#0a0a14',
    seed: 9,
  },
};

export const Confetti: Story = {
  args: {
    count: 120,
    colors: ['#f97316', '#14b8a6', '#6366f1', '#eab308'],
    size: [3, 6],
    speed: 1.4,
    links: false,
    shape: 'square',
    interaction: 'repel',
    interactionRadius: 180,
    direction: 70,
    background: '#faf7f2',
    seed: 17,
  },
};
