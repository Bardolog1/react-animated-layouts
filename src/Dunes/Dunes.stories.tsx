import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dunes, type DunesProps } from './Dunes';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const Label = ({ children, color = '#fff' }: { children: string; color?: string }) => (
  <div style={{ display: 'grid', placeItems: 'center', height: '60%', color, font: '600 28px/1.2 system-ui, sans-serif' }}>{children}</div>
);

const meta = {
  title: 'Layouts/Dunes',
  component: Dunes,
  parameters: { layout: 'fullscreen' },
  args: {
    layers: 5,
    variant: 'dunes',
    roughness: 0.5,
    colors: ['#c98a76', '#a96a6e', '#7f4c65', '#58355a', '#33223f'],
    speed: 1,
    height: 420,
    width: '100%',
    sky: ['#1f2a52', '#7a4a7e', '#e8957a', '#f6d2a0'],
    sun: true,
    sunColor: '#fff1d0',
    sunSize: 110,
    sunPosition: [0.7, 0.4],
    fog: 0.35,
    flip: false,
    seed: 1,
  },
  argTypes: {
    layers: range(1, 10),
    variant: { control: 'inline-radio', options: ['dunes', 'mountains'] },
    roughness: range(0, 1, 0.05),
    colors: { control: 'object' },
    speed: range(-4, 4, 0.1),
    height: range(200, 800, 10),
    width: { control: 'text' },
    sky: { control: 'object' },
    sun: { control: 'boolean' },
    sunColor: { control: 'color' },
    sunSize: range(20, 300, 5),
    sunPosition: { control: 'object' },
    fog: range(0, 1, 0.05),
    flip: { control: 'boolean' },
    seed: range(0, 99),
    className: { control: 'text' },
    style: { control: 'object' },
    children: { control: false },
  },
  render: (args: DunesProps) => (
    <Dunes {...args}>
      <Label>Dunes</Label>
    </Dunes>
  ),
} satisfies Meta<typeof Dunes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dusk: Story = {};

export const Alpine: Story = {
  args: {
    variant: 'mountains',
    layers: 5,
    roughness: 0.7,
    colors: ['#b7c6d8', '#8aa0bb', '#5d7595', '#3a506f', '#1f2f4a'],
    sky: ['#9cc0e3', '#dbe8f4', '#f7efe2'],
    sunColor: '#fffaf0',
    sunSize: 70,
    sunPosition: [0.25, 0.3],
    fog: 0.5,
    speed: 0.6,
    seed: 6,
  },
};

export const Night: Story = {
  args: {
    variant: 'mountains',
    layers: 4,
    roughness: 0.55,
    colors: ['#2c3a63', '#222d52', '#171f3d', '#0d1226'],
    sky: ['#05070f', '#0d1530', '#1d2a55'],
    sunColor: '#e8ecff',
    sunSize: 60,
    sunPosition: [0.8, 0.22],
    fog: 0.3,
    speed: 0.5,
    seed: 11,
  },
};

export const Sahara: Story = {
  args: {
    layers: 6,
    roughness: 0.2,
    colors: ['#f0cf9c', '#e2b57c', '#cd9a62', '#b27e4d', '#8f6038', '#6a4429'],
    sky: ['#7fb2d6', '#cfe3ee', '#f8e7c8'],
    sunColor: '#fff6d8',
    sunSize: 90,
    fog: 0.4,
    speed: 0.8,
    seed: 2,
  },
};
