import os
from docx import Document
import pymysql

# 配置
WORD_DIR = './public/word_docs'  # Word文档所在目录
UPLOAD_PATH_PREFIX = '/upload/global_files/'  # 你服务器上存放文件的路径前缀
CREATED_BY = 1  # 上传用户ID，根据实际情况填写

# 数据库配置
DB_CONFIG = {
    'host': '39.108.113.103',
    'user': 'campus_user',
    'password': 'CampusLLM123!',
    'database': 'campus_llm_db',
    'charset': 'utf8mb4',
    'port': 3306   # 这里必须是整数
}

def extract_docx_content(file_path):
    doc = Document(file_path)
    content = '\n'.join([para.text for para in doc.paragraphs])
    return content

def get_mime_type(filename):
    if filename.lower().endswith('.docx'):
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    elif filename.lower().endswith('.doc'):
        return 'application/msword'
    else:
        return 'application/octet-stream'

def main():
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    sql = """
    INSERT INTO global_files
    (filename, original_name, file_size, mime_type, upload_path, category, description, content_preview, content, created_by)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    for fname in os.listdir(WORD_DIR):
        if not fname.lower().endswith('.docx'):
            continue
        file_path = os.path.join(WORD_DIR, fname)
        content = extract_docx_content(file_path)
        file_size = os.path.getsize(file_path)
        mime_type = get_mime_type(fname)
        upload_path = os.path.join(UPLOAD_PATH_PREFIX, fname)
        category = 'general'
        description = content[:200]  # 前200字作为描述
        content_preview = content[:500]  # 前500字作为内容预览

        print(f'导入: {fname} ({file_size} bytes)')

        cursor.execute(sql, (
            fname,           # filename
            fname,           # original_name
            file_size,       # file_size
            mime_type,       # mime_type
            upload_path,     # upload_path
            category,        # category
            description,     # description
            content_preview, # content_preview
            content,         # content
            CREATED_BY       # created_by
        ))

    conn.commit()
    cursor.close()
    conn.close()
    print('全部导入完成！')

if __name__ == '__main__':
    main()