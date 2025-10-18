# 任务管理应用项目详情

**项目名称:** 任务管理应用
**技术栈:** React, Redux, Firebase
**项目描述:**

这是一个基于React和Redux构建的任务管理Web应用，旨在帮助用户高效地组织和管理日常任务。后端使用Google Firebase提供实时数据库和认证服务。

## 功能特点

-   **任务创建与编辑:** 方便地添加、修改任务。
-   **拖拽排序:** 直观地调整任务顺序和优先级。
-   **状态管理:** 使用Redux进行全局状态管理，确保数据一致性。
-   **用户认证:** 基于Firebase的邮箱/密码认证。

## 技术细节

前端采用React组件化开发，Redux管理应用状态，实现数据流的单向性。Firebase提供后端即服务（BaaS），包括Firestore实时数据库和Authentication服务，大大简化了后端开发。

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import store from './store';
import { Provider } from 'react-redux';

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
);
```

## 部署

该应用可以部署在Firebase Hosting或其他静态网站托管服务上。需要配置Firebase项目和API密钥。

--- 

**GitHub仓库:** [kinghaonan/task-manager-app](https://github.com/kinghaonan/task-manager-app)

