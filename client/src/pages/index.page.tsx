import type { TaskId } from 'commonTypesWithClient/ids';
import type { TaskModel } from 'commonTypesWithClient/models';
import { useAtom } from 'jotai';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Loading } from 'src/components/Loading/Loading';
import { HumanIcon } from 'src/components/icons/HumanIcon';
import { BasicHeader } from 'src/pages/@components/BasicHeader/BasicHeader';
import { apiClient } from 'src/utils/apiClient';
import { returnNull } from 'src/utils/returnNull';
import { timeSince } from 'src/utils/time';
import { userAtom } from '../atoms/user';
import styles from './index.module.css';

const Home = () => {
  const [user] = useAtom(userAtom);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [tasks, setTasks] = useState<TaskModel[]>();
  const [label, setLabel] = useState('');
  const [image, setImage] = useState<File>();
  const [editingTaskId, setEditingTaskId] = useState<TaskId | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');

  const inputLabel = (e: ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
  };
  const inputFile = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.files?.[0]);
  };
  const fetchTasks = async () => {
    const tasks = await apiClient.public.tasks.$get().catch(returnNull);

    if (tasks !== null) setTasks(tasks);
  };
  const createTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!label || !fileRef.current) return;

    await apiClient.private.tasks.post({ body: { label, image } }).catch(returnNull);
    setLabel('');
    setImage(undefined);
    fileRef.current.value = '';
    await fetchTasks();
  };
  const toggleDone = async (task: TaskModel) => {
    await apiClient.private.tasks
      .patch({ body: { taskId: task.id, done: !task.done } })
      .catch(returnNull);
    await fetchTasks();
  };
  const deleteTask = async (task: TaskModel) => {
    await apiClient.private.tasks.delete({ body: { taskId: task.id } }).catch(returnNull);
    await fetchTasks();
  };
  const startEditTask = (task: TaskModel) => {
    setEditingTaskId(task.id);
    setEditingLabel(task.label);
  };
  const saveEditTask = async () => {
    if (editingTaskId !== null) {
      await apiClient.private.tasks.post({ body: { label: editingLabel } }).catch(returnNull);
      setEditingTaskId(null);
      setEditingLabel('');
      await fetchTasks();
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const renderEditField = (task: TaskModel) => {
    return editingTaskId === task.id ? (
      <input
        type="text"
        value={editingLabel}
        className={styles.labelInput}
        onChange={(e) => setEditingLabel(e.target.value)}
      />
    ) : (
      <span>{task.label}</span>
    );
  };
  const renderEditButtons = (task: TaskModel) => {
    return editingTaskId === task.id ? (
      <input type="button" value="SAVE" className={styles.btn} onClick={() => saveEditTask()} />
    ) : (
      <input
        type="button"
        value="EDIT"
        className={styles.btn}
        onClick={() => startEditTask(task)}
      />
    );
  };

  const renderTaskImage = (task: TaskModel) => {
    if (!task.image) return null;
    return task.image?.url ? (
      <img src={task.image.url} alt={task.label} className={styles.taskImage} />
    ) : null;
  };

  if (!tasks) return <Loading visible />;

  return (
    <>
      <BasicHeader user={user} />
      <div className={styles.container}>
        <ul className={styles.tasks}>
          <li className={styles.createTask}>
            <input
              type="text"
              placeholder="What is happening?!"
              value={label}
              onChange={inputLabel}
              className={styles.createTaskInput}
            />
            <div>
              <input
                type="file"
                ref={fileRef}
                accept=".png,.jpg,.jpeg,.gif,.webp,.svg"
                onChange={inputFile}
              />
            </div>
            <button onClick={createTask} className={styles.postBtn}>
              POST
            </button>
          </li>
          {tasks.map((task) => (
            <>
              <li className={styles.taskHeader}>
                <div className={styles.authorDetails}>
                  {user && user.photoURL !== undefined ? (
                    <img
                      className={styles.authorIcon}
                      src={user.photoURL}
                      height={24}
                      alt={user.displayName}
                    />
                  ) : (
                    <HumanIcon size={24} fill="#555" />
                  )}
                  <div className={styles.authorName}>{task.author.name}</div>
                </div>
                <div className={styles.taskTime}>{timeSince(task.createdTime)}</div>
              </li>
              <li className={styles.label} key={task.id}>
                {user && user.id === task.author.userId ? (
                  <label>
                    <div className={styles.editGroup}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleDone(task)}
                      />
                      {renderEditField(task)}
                    </div>
                    <div className={styles.btnGroup}>
                      <input
                        type="button"
                        value="DELETE"
                        className={styles.btn}
                        onClick={() => deleteTask(task)}
                      />
                      {renderEditButtons(task)}
                    </div>
                  </label>
                ) : (
                  <span>{task.label}</span>
                )}
                {renderTaskImage(task)}
              </li>
            </>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Home;
