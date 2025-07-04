// src/components/Project/ProjectList.tsx

import useAppDispatch from '../../hooks/use-app.dispatch';
import useAppSelector from '../../hooks/use-app.selector';


import { taskSelector } from '../../slices/task.slice';

const TaskList = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector(taskSelector);

  return (
    <div>
    </div>
  );
};

export default TaskList
