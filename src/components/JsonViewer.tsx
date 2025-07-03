import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  initialExpanded?: boolean;
  maxDepth?: number;
}

interface JsonNodeProps {
  keyName: string;
  value: any;
  depth: number;
  maxDepth: number;
  path: string;
  expandedState: Record<string, boolean>;
  onToggle: (path: string, expanded: boolean) => void;
}

function JsonNode({ keyName, value, depth, maxDepth, path, expandedState, onToggle }: JsonNodeProps) {
  const [copied, setCopied] = useState(false);
  const isExpanded = expandedState[path] || false;
  

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  const handleCopyValue = useCallback(() => {
    const textToCopy = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [path]);

  const handleToggle = () => {
    onToggle(path, !isExpanded);
  };

  const getValuePreview = () => {
    if (isObject) {
      const keys = Object.keys(value);
      const count = keys.length;
      return `{${count} ${count === 1 ? 'property' : 'properties'}}`;
    }
    if (isArray) {
      return `[${value.length} ${value.length === 1 ? 'item' : 'items'}]`;
    }
    if (typeof value === 'string') {
      return `"${value}"`;
    }
    if (value === null) {
      return 'null';
    }
    if (value === undefined) {
      return 'undefined';
    }
    return String(value);
  };

  const getValueColor = () => {
    if (typeof value === 'string') return 'text-green-600';
    if (typeof value === 'number') return 'text-blue-600';
    if (typeof value === 'boolean') return 'text-purple-600';
    if (value === null || value === undefined) return 'text-gray-400';
    return 'text-gray-700';
  };

  return (
    <div className="font-mono text-sm">
      <div className="flex items-start group">
        {isExpandable && (
          <button
            onClick={handleToggle}
            className="p-0.5 hover:bg-gray-100 rounded transition-colors duration-150"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
        {!isExpandable && <span className="w-5" />}
        
        <span className="text-gray-700 font-medium">{keyName}:</span>
        
        {!isExpanded && (
          <span className={`ml-2 ${getValueColor()}`}>
            {getValuePreview()}
          </span>
        )}
        
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-1">
          <button
            onClick={handleCopyValue}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700"
            title="Copy value"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </button>
          {depth > 0 && (
            <button
              onClick={handleCopyPath}
              className="px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
              title="Copy path"
            >
              {path}
            </button>
          )}
        </div>
      </div>
      
      {isExpandable && isExpanded && (
        <div className="ml-5 mt-1 border-l-2 border-gray-200 pl-4">
          {isObject && 
            Object.entries(value).map(([k, v]) => {
              const childPath = path ? `${path}.${k}` : k;
              return (
                <JsonNode
                  key={k}
                  keyName={k}
                  value={v}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  path={childPath}
                  expandedState={expandedState}
                  onToggle={onToggle}
                />
              );
            })
          }
          {isArray &&
            value.map((item: any, index: number) => {
              const childPath = `${path}[${index}]`;
              return (
                <JsonNode
                  key={index}
                  keyName={`[${index}]`}
                  value={item}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  path={childPath}
                  expandedState={expandedState}
                  onToggle={onToggle}
                />
              );
            })
          }
        </div>
      )}
    </div>
  );
}

export function JsonViewer({ data, initialExpanded = false, maxDepth = 10 }: JsonViewerProps) {
  const [expandedState, setExpandedState] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const handleToggle = (path: string, expanded: boolean) => {
    setExpandedState(prev => ({
      ...prev,
      [path]: expanded
    }));
  };

  const getAllPaths = (obj: any, prefix = '', paths: string[] = []): string[] => {
    if (obj && typeof obj === 'object') {
      if (Array.isArray(obj)) {
        // Add the current array path first
        if (prefix) paths.push(prefix);
        obj.forEach((item, index) => {
          const newPath = `${prefix}[${index}]`;
          if (item && typeof item === 'object') {
            paths.push(newPath);
            getAllPaths(item, newPath, paths);
          }
        });
      } else {
        // Add the current object path first
        if (prefix) paths.push(prefix);
        Object.entries(obj).forEach(([key, value]) => {
          const newPath = prefix ? `${prefix}.${key}` : key;
          if (value && typeof value === 'object') {
            paths.push(newPath);
            getAllPaths(value, newPath, paths);
          }
        });
      }
    }
    return paths;
  };

  const handleExpandAll = () => {
    const allPaths = getAllPaths(data);
    const newExpandedState: Record<string, boolean> = {};
    allPaths.forEach(path => {
      newExpandedState[path] = true;
    });
    setExpandedState(newExpandedState);
  };

  const handleCollapseAll = () => {
    setExpandedState({});
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (data === null || data === undefined) {
    return (
      <div className="text-gray-400 text-sm">
        {data === null ? 'null' : 'undefined'}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">JSON Data</h4>
        <div className="flex gap-2">
          <button
            onClick={handleExpandAll}
            className="px-3 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors duration-150"
          >
            Expand All
          </button>
          <button
            onClick={handleCollapseAll}
            className="px-3 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors duration-150"
          >
            Collapse All
          </button>
          <button
            onClick={handleCopyAll}
            className="px-3 py-1 text-xs bg-white hover:bg-gray-100 border border-gray-300 rounded transition-colors duration-150 flex items-center gap-1"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            Copy JSON
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {typeof data === 'object' && !Array.isArray(data) ? (
          Object.entries(data).map(([key, value]) => (
            <JsonNode
              key={key}
              keyName={key}
              value={value}
              depth={0}
              maxDepth={maxDepth}
              path={key}
              expandedState={expandedState}
              onToggle={handleToggle}
            />
          ))
        ) : Array.isArray(data) ? (
          data.map((item, index) => (
            <JsonNode
              key={index}
              keyName={`[${index}]`}
              value={item}
              depth={0}
              maxDepth={maxDepth}
              path={`[${index}]`}
              expandedState={expandedState}
              onToggle={handleToggle}
            />
          ))
        ) : (
          <div className="text-sm">
            <JsonNode
              keyName="value"
              value={data}
              depth={0}
              maxDepth={maxDepth}
              path="value"
              expandedState={expandedState}
              onToggle={handleToggle}
            />
          </div>
        )}
      </div>
    </div>
  );
}