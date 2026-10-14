import type { RouteObject } from 'react-router';
import Placeholder from './routes/Placeholder';

export const routes: RouteObject[] = [{ path: '*', element: <Placeholder /> }];
