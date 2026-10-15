import type { Meta, StoryObj } from '@storybook/react-vite';
import { Waves, Aurora, Gradient } from './index';

const range = (min: number, max: number, step = 1) => ({ control: { type: 'range' as const, min, max, step } });

const meta: Meta = { title: 'Layouts', parameters: { layout: 'fullscreen' } };
export default meta;

export const WavesDefault: StoryObj<typeof Waves> = {
  render: (args) => <Waves {...args} />,
  argTypes: {
    height: range(40, 400, 10),
    amplitude: range(0, 100),
    frequency: range(1, 8),
    speed: range(-4, 4, 0.1),
    layers: range(1, 8),
    opacity: range(0.1, 1, 0.05),
  },
};

export const WavesSunset: StoryObj<typeof Waves> = {
  render: (args) => <Waves {...args} />,
  args: { colors: ['#fb923c', '#f43f5e', '#7c3aed'], height: 220, amplitude: 28, frequency: 3, layers: 4 },
};

export const WavesHanging: StoryObj<typeof Waves> = {
  render: (args) => <Waves {...args} />,
  args: { flip: true, colors: ['#a78bfa', '#6366f1', '#312e81'], height: 200 },
};

export const AuroraDefault: StoryObj<typeof Aurora> = {
  render: (args) => (
    <Aurora {...args}>
      <h1 style={{ color: '#fff', textAlign: 'center', paddingTop: 120, margin: 0, fontFamily: 'sans-serif' }}>Aurora</h1>
    </Aurora>
  ),
  argTypes: { blobs: range(1, 10), blur: range(0, 120, 5), speed: range(-4, 4, 0.1), opacity: range(0.1, 1, 0.05) },
};

export const GradientDefault: StoryObj<typeof Gradient> = {
  render: (args) => <Gradient {...args} />,
  argTypes: { angle: range(0, 360, 5), speed: range(-4, 4, 0.1) },
};
