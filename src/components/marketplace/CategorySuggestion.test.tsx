import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CategorySuggestion from './CategorySuggestion';
import { apiSuggestCategory } from '../../api/ai.api';
vi.mock('../../api/ai.api',()=>({apiSuggestCategory:vi.fn()}));
const categories=[{id:'laptop',name:'Computer & Laptop Repair',description:'Laptops and PCs',aliases:['PC repair']},{id:'plumbing',name:'Plumbing'}];
const base={title:'LAPTOP FAN NOT TURNING',description:'Fan does not spin.',categories,selectedId:'',onChoose:vi.fn(),tone:'seeker' as const};
describe('confirmed AI category suggestions',()=>{
  beforeEach(()=>vi.clearAllMocks());
  it('suggests only existing categories and waits for the user to apply one',async()=>{
    vi.mocked(apiSuggestCategory).mockResolvedValue({success:true,data:{suggestions:[{id:'laptop',name:'wrong model label'},{id:'invented',name:'Invented'}],source:'gemini'}});
    render(<CategorySuggestion {...base}/>);fireEvent.click(screen.getByRole('button',{name:'Suggest category'}));
    expect(await screen.findByRole('button',{name:/Computer & Laptop Repair.*Use category/})).toBeInTheDocument();
    expect(base.onChoose).not.toHaveBeenCalled();expect(screen.queryByText('Invented')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:/Use category/}));expect(base.onChoose).toHaveBeenCalledWith('laptop');
  });
  it('ignores stale suggestions and allows retrying after failures',async()=>{
    let finish!:(value:Awaited<ReturnType<typeof apiSuggestCategory>>)=>void;
    vi.mocked(apiSuggestCategory).mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
    const view=render(<CategorySuggestion {...base}/>);fireEvent.click(screen.getByRole('button',{name:'Suggest category'}));
    expect(screen.getByRole('button',{name:'Finding categories…'})).toBeDisabled();
    view.rerender(<CategorySuggestion {...base} title="PIPE IS LEAKING"/>);
    await act(async()=>finish({success:true,data:{suggestions:[{id:'laptop',name:'Laptop'}],source:'gemini'}}));
    expect(screen.queryByRole('button',{name:/Use category/})).not.toBeInTheDocument();
    vi.mocked(apiSuggestCategory).mockRejectedValueOnce(new Error('Offline'));
    fireEvent.click(screen.getByRole('button',{name:'Suggest category'}));await waitFor(()=>expect(screen.getByRole('status')).toBeInTheDocument());
    expect(screen.getByRole('button',{name:'Suggest category'})).toBeEnabled();
    expect(base.onChoose).not.toHaveBeenCalled();
  });
});
