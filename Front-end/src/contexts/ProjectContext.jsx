import { createContext, useContext, useState, useEffect } from 'react';
import lessonApi from '../api/lessonApi';
import { useAuth } from '../hooks/useAuth';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [lastFetched, setLastFetched] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProjects = async (force = false) => {
    // Nếu đã có dữ liệu và không bắt buộc load lại (force), thì không cần hiện loading
    if (projects.length > 0 && !force) {
        // Vẫn gọi ngầm để cập nhật nhưng không làm trống danh sách
    } else {
        setIsLoading(true);
    }

    try {
      const { data } = await lessonApi.getAll();
      setProjects(data);
      setLastFetched(Date.now());
    } catch (err) {
      console.error('Lỗi khi tải danh sách dự án:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động tải dự án khi user đăng nhập
  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
    }
  }, [user]);

  return (
    <ProjectContext.Provider value={{ projects, setProjects, fetchProjects, isLoading, lastFetched }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProjects = () => useContext(ProjectContext);
