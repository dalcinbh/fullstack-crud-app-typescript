// src/components/ProjectList.tsx

import useAppDispatch from '../../hooks/use-app.dispatch';
import useAppSelector from '../../hooks/use-app.selector';


import { projectSelector } from '../../slices/project.slice';

const ProjectList = () => {
  const dispatch = useAppDispatch();
  const { projects } = useAppSelector(projectSelector);

  return (
    <div>
    </div>
  );
};

export default ProjectList;
