import type { DefineMethods } from 'aspida';
import type { Maybe, TaskId } from 'commonTypesWithClient/ids';
import type { TaskModel } from 'commonTypesWithClient/models';

export type Methods = DefineMethods<{
  post: {
    reqFormat: FormData;
    reqBody: {
      label: string;
      image?: Blob;
    };
    resBody: TaskModel;
  };

  patch: {
    reqBody: {
      taskId: Maybe<TaskId>;
      done: boolean;
      label: string;
    };
    status: 204;
    resBody: TaskModel;
  };

  delete: {
    reqBody: {
      taskId: Maybe<TaskId>;
    };
    status: 204;
  };
}>;
