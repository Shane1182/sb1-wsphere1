import React from 'react';
import { DocumentUploader } from './DocumentUploader';
import { ModuleEditor } from './ModuleEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

export function ModuleCreator() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Learning Module</h1>
      
      <Tabs defaultValue="editor">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="editor">Manual Editor</TabsTrigger>
          <TabsTrigger value="document">Document Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="editor">
          <ModuleEditor />
        </TabsContent>
        
        <TabsContent value="document">
          <DocumentUploader />
        </TabsContent>
      </Tabs>
    </div>
  );
}