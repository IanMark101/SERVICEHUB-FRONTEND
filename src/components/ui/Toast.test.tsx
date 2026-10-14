import {fireEvent,render,screen} from '@testing-library/react';
import {describe,expect,it} from 'vitest';
import {ToastProvider,useToast} from './Toast';
function Trigger(){const toast=useToast();return <><button onClick={()=>toast.error('Location required','Choose your service area.')}>Error</button><button onClick={()=>toast.success('Saved')}>Success</button><button onClick={()=>toast.success('Listing saved','Available in Saved.','seeker')}>Seeker save</button><button onClick={()=>toast.success('Listing saved','Available in Saved.','provider')}>Provider save</button></>;}
describe('semantic toast feedback',()=>{
  it.each(['seeker','provider'])('keeps %s save feedback separate from error styling', tone => {
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name:tone === 'seeker' ? 'Seeker save' : 'Provider save' }));
    expect(screen.getByRole('status')).toHaveAttribute('data-feedback-tone', tone);
    expect(screen.getByRole('status')).toHaveAttribute('data-feedback-kind', 'success');
    fireEvent.click(screen.getByRole('button', { name:'Error' }));
    expect(screen.getByRole('alert')).toHaveAttribute('data-feedback-kind','error');
    expect(screen.getByRole('alert')).not.toHaveAttribute('data-feedback-tone');
  });
  it('announces errors as alerts with their error kind in either workspace',()=>{
    render(<div data-feedback-workspace="provider"><ToastProvider><Trigger/></ToastProvider></div>);
    fireEvent.click(screen.getByRole('button',{name:'Error'}));
    const alert=screen.getByRole('alert');
    expect(alert).toHaveAttribute('data-feedback-kind','error');
    expect(alert).toHaveAttribute('aria-live','assertive');
    fireEvent.click(screen.getByRole('button',{name:'Dismiss toast'}));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:'Success'}));
    expect(screen.getByRole('status')).toHaveAttribute('data-feedback-kind','success');
  });
});
