import { TypedUseSelectorHook, useSelector } from 'react-redux';
import type { RootState } from '../store';

//Typed hook for the useSelector
const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
