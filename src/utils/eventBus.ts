import type { AddPanelPositionOptions } from "dockview-react";
import mitt from "mitt";

type AppEvents = {
  addpanel: { component: string; position?: AddPanelPositionOptions }; // 添加面板
  setleftsidebar: boolean; // 设置左侧边栏显示状态
  setrightsidebar: boolean; // 设置右侧边栏显示状态
  openpanelsettings: undefined; // 打开面板设置
  setActiveMainPanelId: string; // 设置当前活动的主面板ID
  togglelayoutchecked: string; // 切换布局选中状态
  deletelayoutchecked: string; // 删除布局选中状态
  togglelayoutcheckedall: undefined; // 切换所有布局选中状态
};

export const eventBus = mitt<AppEvents>();

// 可选：导出类型，方便其他地方使用
export type { AppEvents };
