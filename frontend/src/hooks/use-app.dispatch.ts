import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

//Typed hook for the dispatch
const useAppDispatch = () => useDispatch<AppDispatch>();

export default useAppDispatch;
