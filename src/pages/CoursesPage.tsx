import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Course, CourseSection, CourseResource, ApiFile, Semester } from '../types';
import { courseAPI, folderAPI, fileAPI, semesterAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './CoursesPage.css';

interface CoursesPageProps {
  selectedSemester: string;
  onSemesterChange: (semester: string) => void;
  isSidebarCollapsed?: boolean;
}

interface CourseFormData {
  name: string;
  code: string;
  description: string;
}

// 国际化文本
const i18nTexts = {
  'zh_CN': {
    // 页面标题
    pageTitle: '课程',
    
    // 课程资源
    courseResources: '课程资源',
    outline: 'OUTLINE',
    outlineDesc: '课程大纲',
    tutorial: 'TUTORIAL', 
    tutorialDesc: '辅导课程',
    lecture: 'LECTURE',
    lectureDesc: '课件教材',
    assignments: 'ASSIGNMENTS',
    assignmentsDesc: '作业任务',
    exams: 'EXAMS',
    examsDesc: '考试安排',
    others: 'OTHERS',
    othersDesc: '其他资源',
    
    // 课程操作
    addCourse: '+ 添加课程',
    deleteCourse: '删除课程',
    editCourse: '编辑课程',
    newChat: '💬 新建聊天',
    startCourseChat: '课程聊天', // 添加这行
    
    // 表单
    addNewCourse: '添加新课程',
    courseName: '课程名称',
    courseCode: '课程代码',
    courseDescription: '课程描述',
    courseNamePlaceholder: '请输入课程名称',
    courseCodePlaceholder: '请输入课程代码',
    courseDescPlaceholder: '请输入课程描述（可选）',
    required: '*',
    
    // 按钮
    save: '保存',
    cancel: '取消',
    close: '关闭',
    create: '创建课程',
    creating: '创建中...',
    confirm: '确定',
    
    // 文件
    noFiles: '暂无文件',
    items: '项',
    uploadFiles: '上传文件',
    downloadFile: '下载文件',
    deleteFile: '删除文件',
    uploadingFiles: '上传中...',
    
    // 提示信息
    deleteConfirm: '确定要删除这个课程吗？',
    deleteFileConfirm: '确定要删除这个文件吗？',
    uploadSuccess: '文件上传成功',
    uploadError: '文件上传失败',
    deleteSuccess: '删除成功',
    deleteError: '删除失败',
    loadError: '加载失败',
    
    // 学期
    otherSemester: '其他学期',
    allSemesters: '所有学期',
    
    // 学期格式
    semesterFormat: {
      t1: 'T1',
      t2: 'T2'
    },
    
    // 滑动控制
    slideToStart: '滑动到开始',
    slideLeft: '向左滑动', 
    slideRight: '向右滑动',
    slideToEnd: '滑动到结束'
  },
  'en': {
    // 页面标题
    pageTitle: 'Courses',
    
    // 课程资源
    courseResources: 'Course Resources',
    outline: 'OUTLINE',
    outlineDesc: 'Course Outline',
    tutorial: 'TUTORIAL',
    tutorialDesc: 'Tutorial Sessions',
    lecture: 'LECTURE', 
    lectureDesc: 'Lecture Materials',
    assignments: 'ASSIGNMENTS',
    assignmentsDesc: 'Assignments',
    exams: 'EXAMS',
    examsDesc: 'Examinations',
    others: 'OTHERS',
    othersDesc: 'Other Resources',
    
    // 课程操作
    addCourse: '+ Add Course',
    deleteCourse: 'Delete Course',
    editCourse: 'Edit Course',
    newChat: '💬 New Chat',
    startCourseChat: 'Course Chat', // 添加这行
    
    // 表单
    addNewCourse: 'Add New Course',
    courseName: 'Course Name',
    courseCode: 'Course Code',
    courseDescription: 'Course Description',
    courseNamePlaceholder: 'Enter course name',
    courseCodePlaceholder: 'Enter course code',
    courseDescPlaceholder: 'Enter course description (optional)',
    required: '*',
    
    // 按钮
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    create: 'Create Course',
    creating: 'Creating...',
    confirm: 'Confirm',
    
    // 文件
    noFiles: 'No files',
    items: 'items',
    uploadFiles: 'Upload Files',
    downloadFile: 'Download File',
    deleteFile: 'Delete File',
    uploadingFiles: 'Uploading...',
    
    // 提示信息
    deleteConfirm: 'Are you sure you want to delete this course?',
    deleteFileConfirm: 'Are you sure you want to delete this file?',
    uploadSuccess: 'File uploaded successfully',
    uploadError: 'File upload failed',
    deleteSuccess: 'Deleted successfully',
    deleteError: 'Delete failed',
    loadError: 'Load failed',
    
    // 学期
    otherSemester: 'Other Semesters',
    allSemesters: 'All Semesters',
    
    // 学期格式
    semesterFormat: {
      t1: 'T1',
      t2: 'T2'
    },
    
    // 滑动控制
    slideToStart: 'Slide to start',
    slideLeft: 'Slide left',
    slideRight: 'Slide right', 
    slideToEnd: 'Slide to end'
  }
};

interface FolderState {
  loading: boolean;
  error: string | null;
  files: ApiFile[];
}

const CoursesPage: React.FC<CoursesPageProps> = ({ 
  selectedSemester, 
  onSemesterChange,
  isSidebarCollapsed
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 状态管理
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<{
    id: string;
    name: string;
    code: string;
    description: string;
  } | null>(null);
  const [selectedResource, setSelectedResource] = useState<string>('outline');
  // 更新文件状态结构 - 每个文件夹独立的加载状态
  const [courseFiles, setCourseFiles] = useState<{ 
    [courseId: string]: { 
      [sectionId: string]: FolderState 
    } 
  }>({});
  
  // 新增表单弹窗状态
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({
    name: '',
    code: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 滑动控制状态
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 获取用户语言设置
  const userLanguage = user?.preferred_language || 'zh_CN';
  const t = i18nTexts[userLanguage] || i18nTexts['zh_CN'];

  // 课程资源数据 - 根据语言动态生成
  const getCourseResources = (): CourseResource[] => [
    {
      id: 'outline',
      name: t.outline,
      icon: '📋',
      count: 0,
      color: '#3b82f6',
      description: t.outlineDesc
    },
    {
      id: 'tutorial',
      name: t.tutorial,
      icon: '🎓',
      count: 0,
      color: '#8b5cf6',
      description: t.tutorialDesc
    },
    {
      id: 'lecture',
      name: t.lecture,
      icon: '📖',
      count: 0,
      color: '#10b981',
      description: t.lectureDesc
    },
    {
      id: 'assignments',
      name: t.assignments,
      icon: '📝',
      count: 0,
      color: '#f59e0b',
      description: t.assignmentsDesc
    },
    {
      id: 'exams',
      name: t.exams,
      icon: '📊',
      count: 0,
      color: '#ef4444',
      description: t.examsDesc
    },
    {
      id: 'others',
      name: t.others,
      icon: '📁',
      count: 0,
      color: '#6b7280',
      description: t.othersDesc
    }
  ];

  const courseResources = getCourseResources();

  // 加载学期数据
  useEffect(() => {
    const loadSemesters = async () => {
      try {
        const response = await semesterAPI.getSemesters();
        setSemesters(response.semesters);
      } catch (error) {
        console.error(t.loadError + ':', error);
      }
    };

    loadSemesters();
  }, []);

  // 加载课程数据 - 根据选择的学期过滤
  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const response = await courseAPI.getCourses();
        let filteredCourses = response.courses || [];
        
        // 根据选择的学期过滤课程
        if (selectedSemester !== 'all') {
          filteredCourses = filteredCourses.filter(course => 
            course.semester_id?.toString() === selectedSemester
          );
        }
        
        const sortedCourses = filteredCourses.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return (b.id || 0) - (a.id || 0);
        });
        
        setCourses(sortedCourses);
        
        // 批量加载文件，避免重复请求
        const courseIds = sortedCourses
          .map(course => course.id?.toString())
          .filter((id): id is string => !!id);
        
        // 并发加载但限制数量，避免过多请求
        await Promise.allSettled(
          courseIds.map(courseId => loadCourseFiles(courseId))
        );
        
      } catch (error) {
        console.error(t.loadError + ':', error);
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [selectedSemester]); // 移除 t 依赖，避免不必要的重新加载

  // 重构文件加载函数 - 支持增量加载
  const loadCourseFiles = async (courseId: string) => {
    try {
      console.log(`开始加载课程 ${courseId} 的文件夹`);
      
      // 初始化所有文件夹的加载状态
      setCourseFiles(prev => ({
        ...prev,
        [courseId]: courseResources.reduce((acc, resource) => ({
          ...acc,
          [resource.id]: { loading: true, error: null, files: [] }
        }), {})
      }));
      
      // 获取课程文件夹
      const foldersResponse = await folderAPI.getCourseFolders(parseInt(courseId));
      console.log(`课程 ${courseId} 文件夹:`, foldersResponse.folders);
      
      // 为每个文件夹独立加载文件
      foldersResponse.folders.forEach(folder => {
        loadFolderFiles(courseId, folder.folder_type, folder.id, folder.name);
      });
      
      // 设置没有对应文件夹的资源类型为完成状态
      const existingFolderTypes = new Set(foldersResponse.folders.map(f => f.folder_type));
      courseResources.forEach(resource => {
        if (!existingFolderTypes.has(resource.id)) {
          setCourseFiles(prev => ({
            ...prev,
            [courseId]: {
              ...prev[courseId],
              [resource.id]: { loading: false, error: null, files: [] }
            }
          }));
        }
      });
      
    } catch (error) {
      console.error(`加载课程 ${courseId} 文件夹失败:`, error);
      
      // 设置所有文件夹为错误状态
      setCourseFiles(prev => ({
        ...prev,
        [courseId]: courseResources.reduce((acc, resource) => ({
          ...acc,
          [resource.id]: { 
            loading: false, 
            error: error instanceof Error ? error.message : '加载失败', 
            files: [] 
          }
        }), {})
      }));
    }
  };

  // 新增：独立的文件夹文件加载函数
  const loadFolderFiles = async (courseId: string, folderType: string, folderId: number, folderName: string) => {
    try {
      console.log(`=== 加载文件夹 ${folderName} (ID: ${folderId}) 的文件 ===`);
      
      const filesResponse = await folderAPI.getFolderFiles(folderId);
      console.log(`文件夹 ${folderName} API 响应:`, JSON.stringify(filesResponse, null, 2));
      
      // 立即更新该文件夹的状态
      setCourseFiles(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          [folderType]: {
            loading: false,
            error: null,
            files: filesResponse.files || []
          }
        }
      }));
      
      console.log(`文件夹 ${folderName} (${folderType}) 文件加载完成: ${filesResponse.files?.length || 0} 个文件`);
      
    } catch (error) {
      console.warn(`加载文件夹 ${folderName} 文件失败:`, error);
      
      // 设置该文件夹的错误状态
      setCourseFiles(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          [folderType]: {
            loading: false,
            error: error instanceof Error ? error.message : '加载失败',
            files: []
          }
        }
      }));
    }
  };

  // 更新资源数量计算
  const getResourceCount = (resourceId: string): number => {
    let totalCount = 0;
    Object.values(courseFiles).forEach(courseFile => {
      const folderState = courseFile[resourceId];
      if (folderState && !folderState.loading && !folderState.error) {
        totalCount += folderState.files.length;
      }
    });
    return totalCount;
  };

  // 获取特定课程和资源的文件夹状态
  const getFolderState = (courseId: string, resourceId: string): FolderState => {
    return courseFiles[courseId]?.[resourceId] || { loading: true, error: null, files: [] };
  };

  // 文件上传处理 - 改善文件夹ID查找逻辑
  const handleFileUpload = async (courseId: string, sectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // 设置上传中状态
    setCourseFiles(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [sectionId]: {
          ...prev[courseId]?.[sectionId],
          loading: true,
          error: null
        }
      }
    }));

    try {
      console.log(`准备为课程 ${courseId} 的 ${sectionId} 区域上传文件`);
      
      let targetFolderId: number | undefined;
      
      try {
        const foldersResponse = await folderAPI.getCourseFolders(parseInt(courseId));
        let targetFolder = foldersResponse.folders.find(folder => folder.folder_type === sectionId);
        
        if (!targetFolder) {
          console.log(`未找到 ${sectionId} 类型的文件夹，尝试创建...`);
          
          const folderName = courseResources.find(r => r.id === sectionId)?.name || sectionId;
          const createFolderResponse = await folderAPI.createFolder({
            name: folderName,
            folder_type: sectionId,
            course_id: parseInt(courseId)
          });
          
          targetFolder = createFolderResponse.folder;
          console.log(`成功创建文件夹: ${folderName} (ID: ${targetFolder.id})`);
        }
        
        targetFolderId = targetFolder?.id;

      } catch (error) {
        console.warn('无法获取或创建文件夹，将上传到课程根目录:', error);
      }
      
      const uploadedFiles: ApiFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          console.log(`开始上传文件: ${file.name}`);
          
          const response = await fileAPI.uploadFile(
            file, 
            parseInt(courseId),
            targetFolderId,
            (progress) => {
              console.log(`文件 ${file.name} 上传进度: ${progress}%`);
            }
          );
          
          uploadedFiles.push(response.file);
        } catch (error) {
          console.error(`文件 ${file.name} 上传失败:`, error);
        }
      }
      
      // 更新文件列表
      if (uploadedFiles.length > 0) {
        setCourseFiles(prev => {
          const currentState = prev[courseId]?.[sectionId] || { loading: false, error: null, files: [] };
          return {
            ...prev,
            [courseId]: {
              ...prev[courseId],
              [sectionId]: {
                loading: false,
                error: null,
                files: [...currentState.files, ...uploadedFiles]
              }
            }
          };
        });
        
        console.log(`成功上传 ${uploadedFiles.length} 个文件`);
      } else {
        // 恢复原状态
        setCourseFiles(prev => ({
          ...prev,
          [courseId]: {
            ...prev[courseId],
            [sectionId]: {
              ...prev[courseId]?.[sectionId],
              loading: false
            }
          }
        }));
      }
      
    } catch (error) {
      console.error('文件上传失败:', error);
      
      // 设置错误状态
      setCourseFiles(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          [sectionId]: {
            ...prev[courseId]?.[sectionId],
            loading: false,
            error: error instanceof Error ? error.message : '上传失败'
          }
        }
      }));
    } finally {
      // 清空文件输入
      setTimeout(() => {
        try {
          if (event.target && event.target.value !== undefined) {
            event.target.value = '';
          }
        } catch (error) {
          // 忽略错误
        }
      }, 0);
    }
  };

  // 添加文件按钮
  const handleAddFile = (courseId: string, sectionId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.xls,.xlsx,.ppt,.pptx';
    input.onchange = (e) => handleFileUpload(courseId, sectionId, e as any);
    input.click();
  };

  // 文件下载处理
  const handleFileDownload = async (fileId: number, fileName: string) => {
    try {
      const blob = await fileAPI.downloadFile(fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('文件下载失败:', error);
    }
  };

  // 更新文件删除处理
  const handleFileDelete = async (fileId: number, courseId: string, sectionId: string, fileName: string) => {
    if (!window.confirm(t.deleteFileConfirm)) return;
    
    try {
      console.log(`开始删除文件: ${fileName} (ID: ${fileId})`);
      
      await fileAPI.deleteFile(fileId);
      
      // 从文件列表中移除
      setCourseFiles(prev => ({
        ...prev,
        [courseId]: {
          ...prev[courseId],
          [sectionId]: {
            ...prev[courseId]?.[sectionId],
            files: prev[courseId]?.[sectionId]?.files.filter(file => file.id !== fileId) || []
          }
        }
      }));
      
      console.log(`文件 ${fileName} 删除成功`);
      
    } catch (error) {
      console.error(`删除文件 ${fileName} 失败:`, error);
      alert(`删除文件 "${fileName}" 失败：${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // 课程相关操作
  const handleOpenCourseForm = () => {
    setCourseFormData({
      name: '',
      code: '',
      description: ''
    });
    setShowCourseForm(true);
  };

  const handleCloseCourseForm = () => {
    setShowCourseForm(false);
    setCourseFormData({
      name: '',
      code: '',
      description: ''
    });
    setIsSubmitting(false);
  };

  const handleFormInputChange = (field: keyof CourseFormData, value: string) => {
    setCourseFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 创建课程
  const handleSubmitCourseForm = async () => {
    if (!courseFormData.name.trim() || !courseFormData.code.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 生成唯一的课程代码
      const baseCode = courseFormData.code.trim();
      let finalCode = baseCode;
      let counter = 1;
      
      // 检查当前学期是否已有相同代码的课程
      const existingCourses = courses.filter(course => 
        course.semester_id?.toString() === selectedSemester && 
        course.code?.toLowerCase() === baseCode.toLowerCase()
      );
      
      // 如果有重复，自动添加数字后缀
      while (existingCourses.some(course => course.code?.toLowerCase() === finalCode.toLowerCase())) {
        counter++;
        finalCode = `${baseCode}_${counter}`;
      }
      
      // 如果代码被修改，提示用户
      if (finalCode !== baseCode) {
        const confirm = window.confirm(
          `课程代码 "${baseCode}" 在当前学期已存在，\n` +
          `是否使用 "${finalCode}" 作为课程代码？`
        );
        
        if (!confirm) {
          setIsSubmitting(false);
          return;
        }
      }

      const newCourse = {
        name: courseFormData.name.trim(),
        code: finalCode,
        description: courseFormData.description.trim(),
        semester_id: selectedSemester !== 'all' ? parseInt(selectedSemester) : 1,
        user_id: user?.id || 1,
      };

      console.log('=== 创建课程调试 ===');
      console.log('课程数据:', newCourse);
      console.log('选择的学期:', selectedSemester);

      const response = await courseAPI.createCourse(newCourse);
      console.log('API 响应:', response);
      
      // 确保课程数据完整性
      const courseToAdd: Course = {
        ...response,
        name: response.name || newCourse.name,
        code: response.code || newCourse.code,
        description: response.description || newCourse.description,
        semester_id: response.semester_id || newCourse.semester_id,
        user_id: response.user_id || newCourse.user_id,
      };
      
      console.log('最终添加的课程:', courseToAdd);
      
      // 课程创建成功后，自动创建标准文件夹
      if (courseToAdd.id) {
        console.log('=== 开始创建标准文件夹 ===');
        
        // 定义6个标准文件夹
        const standardFolders = [
          { name: t.outline, folder_type: 'outline' },
          { name: t.tutorial, folder_type: 'tutorial' },
          { name: t.lecture, folder_type: 'lecture' },
          { name: t.assignments, folder_type: 'assignments' },
          { name: t.exams, folder_type: 'exams' },
          { name: t.others, folder_type: 'others' }
        ];
        
        // 创建所有文件夹
        const folderCreationPromises = standardFolders.map(async (folderData) => {
          try {
            console.log(`创建文件夹: ${folderData.name} (${folderData.folder_type})`);
            
            const folderResponse = await folderAPI.createFolder({
              name: folderData.name,
              folder_type: folderData.folder_type,
              course_id: courseToAdd.id!
            });
            
            console.log(`文件夹 ${folderData.name} 创建成功:`, folderResponse.folder);
            return folderResponse.folder;
          } catch (error) {
            console.error(`创建文件夹 ${folderData.name} 失败:`, error);
            // 即使某个文件夹创建失败，也不影响其他文件夹的创建
            return null;
          }
        });
        
        // 等待所有文件夹创建完成
        const createdFolders = await Promise.allSettled(folderCreationPromises);
        
        // 统计创建结果
        const successCount = createdFolders.filter(result => 
          result.status === 'fulfilled' && result.value !== null
        ).length;
        
        console.log(`文件夹创建完成: ${successCount}/${standardFolders.length} 个成功`);
        
        if (successCount < standardFolders.length) {
          console.warn(`部分文件夹创建失败，成功创建 ${successCount}/${standardFolders.length} 个`);
        }
      }
      
      setCourses(prev => [courseToAdd, ...prev.filter(course => course.id !== courseToAdd.id)]);
      
      // 为新课程加载文件（包括新创建的文件夹）
      if (courseToAdd.id) {
        // 稍微延迟一下，确保文件夹创建完成
        setTimeout(async () => {
          await loadCourseFiles(courseToAdd.id!.toString());
        }, 500);
      }
      
      handleCloseCourseForm();
      
      // 如果代码被修改，显示成功提示
      if (finalCode !== baseCode) {
        alert(`课程创建成功！最终使用的课程代码为：${finalCode}\n已自动为课程创建标准文件夹结构。`);
      } else {
        alert('课程创建成功！已自动为课程创建标准文件夹结构。');
      }
      
    } catch (error) {
      console.error('创建课程失败:', error);
      
      if (error instanceof Error) {
        // 显示友好的错误信息
        if (error.message.includes('already exists')) {
          alert(
            '课程代码在当前学期已存在。\n' +
            '请尝试使用不同的课程代码，或者选择其他学期。'
          );
        } else if (error.message.includes('Authentication')) {
          alert('认证失败，请重新登录后再试。');
        } else {
          alert(`创建课程失败: ${error.message}`);
        }
      } else {
        alert('创建课程失败，请检查网络连接或稍后重试。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 删除课程
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    
    try {
      await courseAPI.deleteCourse(parseInt(courseId));
      
      setCourses(prev => prev.filter(course => course.id?.toString() !== courseId));
      setCourseFiles(prev => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
    } catch (error) {
      console.error(t.deleteError + ':', error);
    }
  };

  // 编辑课程
  const handleCourseEditStart = (courseId: string, currentName: string, currentCode: string, currentDescription: string) => {
    setEditingCourse({
      id: courseId,
      name: currentName,
      code: currentCode,
      description: currentDescription
    });
  };

  const handleCourseEditSave = async () => {
    if (!editingCourse) return;

    try {
      const response = await courseAPI.updateCourse(parseInt(editingCourse.id), {
        name: editingCourse.name,
        code: editingCourse.code,
        description: editingCourse.description
      });

      setCourses(prev => 
        prev.map(course => 
          course.id?.toString() === editingCourse.id 
            ? { ...course, ...response }
            : course
        )
      );
      setEditingCourse(null);
    } catch (error) {
      console.error('更新课程失败:', error);
    }
  };

  const handleCourseEditCancel = () => {
    setEditingCourse(null);
  };

  // 键盘事件处理
  const handleFormKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitCourseForm();
    } else if (e.key === 'Escape') {
      handleCloseCourseForm();
    }
  };

  const handleCourseEditKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCourseEditSave();
    } else if (e.key === 'Escape') {
      handleCourseEditCancel();
    }
  };

  // 课程聊天
  const handleCourseChat = (courseName: string) => {
    navigate(`/course-chat/${encodeURIComponent(courseName)}`);
  };

  // 滑动功能
  const scrollLeft = () => {
    if (scrollRef.current && canScrollLeft) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 400);
    }
  };

  const scrollRight = () => {
    if (scrollRef.current && canScrollRight) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollability, 400);
    }
  };

  const scrollToStart = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      setTimeout(checkScrollability, 400);
    }
  };

  const scrollToEnd = () => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      scrollRef.current.scrollTo({ left: maxScrollLeft, behavior: 'smooth' });
      setTimeout(checkScrollability, 400);
    }
  };

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const tolerance = 1;
      
      const atStart = scrollLeft <= tolerance;
      const maxScrollLeft = scrollWidth - clientWidth;
      const atEnd = scrollLeft >= maxScrollLeft - tolerance;
      
      setCanScrollLeft(!atStart);
      setCanScrollRight(!atEnd && maxScrollLeft > 0);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      const timers = [
        setTimeout(() => checkScrollability(), 100),
        setTimeout(() => checkScrollability(), 300),
        setTimeout(() => checkScrollability(), 500),
        setTimeout(() => checkScrollability(), 800)
      ];
      
      const handleScroll = () => {
        checkScrollability();
      };
      
      const handleResize = () => {
        setTimeout(checkScrollability, 100);
      };
      
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      
      return () => {
        timers.forEach(timer => clearTimeout(timer));
        scrollContainer.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [courseResources]);

  // 处理资源选择
  const handleResourceSelect = (resourceId: string) => {
    setSelectedResource(resourceId);
  };

  // 获取当前学期名称
  const getCurrentSemesterName = () => {
    if (selectedSemester === 'all') {
      return t.allSemesters;
    }
    
    const semester = semesters.find(s => s.id.toString() === selectedSemester);
    if (semester) {
      return semester.name;
    }
    
    return t.otherSemester;
  };

  const handleAddCourse = () => {
    handleOpenCourseForm();
  };

  // 安全获取课程ID字符串
  const getCourseIdString = (course: Course): string => {
    return course.id?.toString() || `temp-${course.name}-${Date.now()}`;
  };

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className={`courses-page ${isSidebarCollapsed ? 'courses-page--sidebar-collapsed' : ''}`}>
        <div className="courses-header">
          <h1 className="courses-title">加载中...</h1>
        </div>
        <div className="courses-container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: '#6b7280'
          }}>
            正在加载课程数据...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`courses-page ${isSidebarCollapsed ? 'courses-page--sidebar-collapsed' : ''}`}>
      <div className="courses-header">
        <h1 className="courses-title">{getCurrentSemesterName()}</h1>
      </div>

      <div className="courses-container">
        <div className="courses-grid">
          {/* 添加课程卡片 */}
          <div className="add-course-card" onClick={handleAddCourse}>
            <div className="add-course-btn">{t.addCourse}</div>
          </div>

          {/* 课程卡片 */}
          {courses.map((course) => {
            const courseIdString = getCourseIdString(course);
            const uploadKey = `${courseIdString}-${selectedResource}`;
            
            return (
              <div key={courseIdString} className="course-card">
                <button 
                  className="course-delete-btn"
                  onClick={() => handleDeleteCourse(courseIdString)}
                  title={t.deleteCourse}
                >
                  ×
                </button>

                <div className="course-left">
                  <div className="course-info">
                    {editingCourse?.id === courseIdString ? (
                      <div className="course-edit-form">
                        <input
                          type="text"
                          value={editingCourse.name}
                          onChange={(e) => setEditingCourse(prev => prev ? { ...prev, name: e.target.value } : null)}
                          onKeyDown={handleCourseEditKeyPress}
                          className="course-name-input"
                          placeholder={t.courseNamePlaceholder}
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editingCourse.code}
                          onChange={(e) => setEditingCourse(prev => prev ? { ...prev, code: e.target.value } : null)}
                          onKeyDown={handleCourseEditKeyPress}
                          className="course-code-input"
                          placeholder={t.courseCodePlaceholder}
                        />
                        <textarea
                          value={editingCourse.description}
                          onChange={(e) => setEditingCourse(prev => prev ? { ...prev, description: e.target.value } : null)}
                          onKeyDown={handleCourseEditKeyPress}
                          className="course-description-input"
                          placeholder={t.courseDescPlaceholder}
                          rows={3}
                        />
                        <div className="course-edit-actions">
                          <button 
                            onClick={handleCourseEditSave}
                            className="course-edit-btn course-edit-btn--save"
                          >
                            {t.save}
                          </button>
                          <button 
                            onClick={handleCourseEditCancel}
                            className="course-edit-btn course-edit-btn--cancel"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="course-text-container"
                        onClick={() => handleCourseEditStart(
                          courseIdString, 
                          course.name || '', 
                          course.code || '', 
                          course.description || ''
                        )}
                      >
                        <h3 className="course-name course-name-editable">
                          {course.name || '未命名课程'}
                        </h3>
                        <p className="course-code course-code-editable">{course.code || ''}</p>
                        <p className="course-description course-description-editable">
                          {course.description || ''}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="course-chat-section">
                    <button 
                      className="course-chat-btn"
                      onClick={() => {
                        // 🔥 确保使用课程ID，并且课程ID存在
                        if (course.id) {
                          navigate(`/course-chat/${course.id}`);
                        } else {
                          console.error('课程ID不存在:', course);
                          alert('无法启动课程聊天：课程ID缺失');
                        }
                      }}
                    >
                      💬 {t.startCourseChat}
                    </button>
                  </div>
                </div>

                {/* 右侧显示选中资源的内容 */}
                <div className="course-right course-right--compact">
                  {selectedResource && (
                    <div className="course-section course-section--featured">
                      <div className="section-header">
                        <span className="section-name">
                          {courseResources.find(r => r.id === selectedResource)?.name}
                        </span>
                        {(() => {
                          const folderState = getFolderState(courseIdString, selectedResource);
                          return (
                            <button 
                              className="section-add-btn"
                              onClick={() => handleAddFile(courseIdString, selectedResource)}
                              disabled={folderState.loading}
                              title={folderState.loading ? t.uploadingFiles : t.uploadFiles}
                            >
                              {folderState.loading ? (
                                <div className="loading-spinner-svg loading-spinner-svg--upload">
                                  <svg viewBox="0 0 16 16">
                                    <circle 
                                      className="circle-bg" 
                                      cx="8" 
                                      cy="8" 
                                      r="7"
                                    />
                                    <circle 
                                      className="circle-inner" 
                                      cx="8" 
                                      cy="8" 
                                      r="5"
                                    />
                                    <circle 
                                      className="circle-progress" 
                                      cx="8" 
                                      cy="8" 
                                      r="7"
                                    />
                                  </svg>
                                </div>
                              ) : (
                                '+'
                              )}
                            </button>
                          );
                        })()}
                      </div>
                      
                      <div className="section-files">
                        {(() => {
                          const folderState = getFolderState(courseIdString, selectedResource);
                          
                          if (folderState.loading) {
                            return (
                              <div className="file-item loading">
                                <div className="loading-spinner-svg loading-spinner-svg--small">
                                  <svg viewBox="0 0 12 12">
                                    <circle className="circle-bg" cx="6" cy="6" r="5" />
                                    <circle className="circle-inner" cx="6" cy="6" r="3.5" />
                                    <circle className="circle-progress" cx="6" cy="6" r="5" />
                                  </svg>
                                </div>
                                <span>加载中...</span>
                              </div>
                            );
                          }
                          
                          if (folderState.error) {
                            return (
                              <div className="file-item error">
                                <span className="file-icon">⚠️</span>
                                <span>加载失败: {folderState.error}</span>
                                <button
                                  className="file-retry-btn"
                                  onClick={() => loadCourseFiles(courseIdString)}
                                  title="重试"
                                >
                                  🔄
                                </button>
                              </div>
                            );
                          }
                          
                          if (folderState.files.length === 0) {
                            return <div className="file-item empty">{t.noFiles}</div>;
                          }
                          
                          return folderState.files.map((file) => (
                            <div key={file.id} className="file-item">
                              <span className="file-icon">📄</span>
                              <span 
                                className="file-name" 
                                title={file.original_name}
                                onClick={() => handleFileDownload(file.id, file.original_name)}
                                style={{ cursor: 'pointer' }}
                              >
                                {file.original_name}
                              </span>
                              <button
                                className="file-delete-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileDelete(file.id, courseIdString, selectedResource, file.original_name);
                                }}
                                title={t.deleteFile}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  marginLeft: 'auto',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '20px',
                                  height: '20px'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部课程资源滑动栏 */}
      <div className="courses-page__bottom-slider">
        <div className="courses-page__slider-header">
          <h3 className="courses-page__slider-title">{t.courseResources}</h3>
          <div className="courses-page__slider-controls">
            <button 
              className={`courses-page__slider-btn ${
                !canScrollLeft ? 'courses-page__slider-btn--disabled' : ''
              }`}
              onClick={scrollToStart}
              disabled={!canScrollLeft}
              aria-label={t.slideToStart}
              title={t.slideToStart}
            >
              ⏮
            </button>
            <button 
              className={`courses-page__slider-btn courses-page__slider-btn--left ${
                !canScrollLeft ? 'courses-page__slider-btn--disabled' : ''
              }`}
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              aria-label={t.slideLeft}
              title={t.slideLeft}
            >
              ←
            </button>
            <button 
              className={`courses-page__slider-btn courses-page__slider-btn--right ${
                !canScrollRight ? 'courses-page__slider-btn--disabled' : ''
              }`}
              onClick={scrollRight}
              disabled={!canScrollRight}
              aria-label={t.slideRight}
              title={t.slideRight}
            >
              →
            </button>
            <button 
              className={`courses-page__slider-btn ${
                !canScrollRight ? 'courses-page__slider-btn--disabled' : ''
              }`}
              onClick={scrollToEnd}
              disabled={!canScrollRight}
              aria-label={t.slideToEnd}
              title={t.slideToEnd}
            >
              ⏭
            </button>
          </div>
        </div>
        
        <div className="courses-page__slider-container">
          <div 
            className="courses-page__slider-content"
            ref={scrollRef}
          >
            {courseResources.map((resource) => (
              <div
                key={resource.id}
                className={`courses-page__resource-card ${
                  selectedResource === resource.id ? 'courses-page__resource-card--active' : ''
                }`}
                onClick={() => handleResourceSelect(resource.id)}
                title={resource.description}
                style={{
                  '--resource-color': resource.color
                } as React.CSSProperties}
              >
                <div className="courses-page__resource-icon">
                  {resource.icon}
                </div>
                <div className="courses-page__resource-info">
                  <h4 className="courses-page__resource-name">{resource.name}</h4>
                  <p className="courses-page__resource-description">{resource.description}</p>
                  <span className="courses-page__resource-count">{getResourceCount(resource.id)} {t.items}</span>
                </div>
                {getResourceCount(resource.id) > 0 && (
                  <div className="courses-page__resource-badge">
                    {getResourceCount(resource.id)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 表单弹窗 */}
      {showCourseForm && (
        <div className="course-form-overlay" onClick={handleCloseCourseForm}>
          <div className="course-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="course-form-header">
              <h3 className="course-form-title">{t.addNewCourse}</h3>
              <button 
                className="course-form-close" 
                onClick={handleCloseCourseForm}
                aria-label={t.close}
              >
                ×
              </button>
            </div>
            
            <div className="course-form-body">
              <div className="course-form-field">
                <label className="course-form-label">
                  {t.courseName} <span className="course-form-required">{t.required}</span>
                </label>
                <input
                  type="text"
                  className="course-form-input"
                  placeholder={t.courseNamePlaceholder}
                  value={courseFormData.name}
                  onChange={(e) => handleFormInputChange('name', e.target.value)}
                  onKeyDown={handleFormKeyPress}
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              <div className="course-form-field">
                <label className="course-form-label">
                  {t.courseCode} <span className="course-form-required">{t.required}</span>
                </label>
                <input
                  type="text"
                  className="course-form-input"
                  placeholder={t.courseCodePlaceholder}
                  value={courseFormData.code}
                  onChange={(e) => handleFormInputChange('code', e.target.value)}
                  onKeyDown={handleFormKeyPress}
                  disabled={isSubmitting}
                />
              </div>

              <div className="course-form-field">
                <label className="course-form-label">{t.courseDescription}</label>
                <textarea
                  className="course-form-textarea"
                  placeholder={t.courseDescPlaceholder}
                  value={courseFormData.description}
                  onChange={(e) => handleFormInputChange('description', e.target.value)}
                  onKeyDown={handleFormKeyPress}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="course-form-footer">
              <button 
                className="course-form-btn course-form-btn--cancel"
                onClick={handleCloseCourseForm}
                disabled={isSubmitting}
              >
                {t.cancel}
              </button>
              <button 
                className="course-form-btn course-form-btn--submit"
                onClick={handleSubmitCourseForm}
                disabled={isSubmitting || !courseFormData.name.trim() || !courseFormData.code.trim()}
              >
                {isSubmitting ? t.creating : t.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
