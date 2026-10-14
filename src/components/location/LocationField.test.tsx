import {render,screen,waitFor} from '@testing-library/react';
import {describe,expect,it,vi} from 'vitest';
import LocationField from './LocationField';
vi.mock('./LocationEditor',()=>({default:()=> <div>Location editor</div>}));
describe('location validation recovery',()=>{
  it('opens and focuses the missing location without losing the form draft',async()=>{
    const {container,rerender}=render(<LocationField required selectionMode="area" label="Service area" value={null} onChange={vi.fn()}/>);
    const summary=container.querySelector('summary')!;
    expect(summary).toHaveTextContent('Choose a city or barangay');
    rerender(<LocationField required selectionMode="area" label="Service area" value={null} onChange={vi.fn()} error="Select a city or barangay."/>);
    await waitFor(()=>expect(summary).toHaveFocus());
    expect(summary.closest('details')).toHaveAttribute('open');
    expect(summary).toHaveAttribute('aria-invalid','true');
    expect(summary.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id);
  });
});
