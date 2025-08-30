// Database types
export type ComponentType = 
  | 'text'
  | 'image'
  | 'button'
  | 'input'
  | 'form'
  | 'container'
  | 'header'
  | 'footer'
  | 'navbar'
  | 'hero'
  | 'card'
  | 'grid'
  | 'flex';

export type ProjectStatus = 'draft' | 'building' | 'deployed' | 'failed';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  canvas_data: CanvasData;
  generated_code: string | null;
  backend_config: BackendConfig;
  deployment_url: string | undefined;
  preview_url: string | undefined;
  created_at: string;
  updated_at: string;
}

export interface Component {
  id: string;
  user_id: string | null;
  name: string;
  type: ComponentType;
  props: Record<string, any>;
  styles: Record<string, any>;
  code: string;
  preview_image: string | null;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ProjectComponent {
  id: string;
  project_id: string;
  component_id: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  z_index: number;
  custom_props: Record<string, any>;
  created_at: string;
}

export interface AIGeneration {
  id: string;
  project_id: string;
  user_id: string;
  prompt: string;
  generation_type: 'frontend' | 'backend' | 'component' | 'full_stack';
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  generated_code: string | null;
  status: 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
}

export interface Deployment {
  id: string;
  project_id: string;
  user_id: string;
  deployment_platform: string;
  deployment_url: string | null;
  status: 'pending' | 'building' | 'success' | 'failed';
  build_logs: string | null;
  environment_variables: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Canvas and UI types
export interface CanvasElement {
  id: string;
  type: ComponentType;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  props: Record<string, any>;
  styles: Record<string, any>;
  children?: CanvasElement[];
  parent_id?: string;
}

export interface CanvasData {
  elements: CanvasElement[];
  page_settings: {
    width: number;
    height: number;
    background_color: string;
    font_family: string;
  };
  responsive_breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface BackendConfig {
  database_schema?: DatabaseSchema;
  api_endpoints?: APIEndpoint[];
  authentication?: AuthConfig;
  environment_variables?: Record<string, string>;
}

export interface DatabaseSchema {
  tables: DatabaseTable[];
  relationships: DatabaseRelationship[];
}

export interface DatabaseTable {
  name: string;
  columns: DatabaseColumn[];
  indexes?: string[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  default_value?: any;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  references?: {
    table: string;
    column: string;
  };
}

export interface DatabaseRelationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
}

export interface APIEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters?: APIParameter[];
  response_schema?: Record<string, any>;
  requires_auth?: boolean;
}

export interface APIParameter {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  validation?: Record<string, any>;
}

export interface AuthConfig {
  providers: string[];
  enable_email_confirmation: boolean;
  enable_password_reset: boolean;
  session_timeout: number;
  role_based_access: boolean;
  roles?: string[];
}

// AI Generation types
export interface AIPrompt {
  type: 'generate_frontend' | 'generate_backend' | 'generate_component' | 'modify_code';
  content: string;
  context?: {
    existing_code?: string;
    design_requirements?: string;
    functionality_requirements?: string;
  };
}

export interface GeneratedCode {
  type: 'react' | 'html' | 'api' | 'database';
  code: string;
  dependencies?: string[];
  instructions?: string;
  preview_url?: string;
}

// UI Component Props
export interface DragDropItem {
  id: string;
  type: ComponentType;
  name: string;
  icon: string;
  defaultProps: Record<string, any>;
  category: 'layout' | 'content' | 'form' | 'navigation' | 'media';
}

export interface CanvasProps {
  elements: CanvasElement[];
  onElementAdd: (element: CanvasElement) => void;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onElementDelete: (id: string) => void;
  onElementSelect: (id: string | null) => void;
  selectedElementId: string | null;
  isPreviewMode?: boolean;
}

export interface PropertyPanelProps {
  selectedElement: CanvasElement | null;
  onElementUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

// Chat Assistant types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    generated_code?: string;
    action_performed?: string;
  };
}

export interface ChatContext {
  current_project?: Project;
  selected_element?: CanvasElement;
  recent_generations?: AIGeneration[];
}
