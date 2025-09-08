'use client'

import React from 'react';
import { parseJobDescription, extractJobSections, formatContentForDisplay } from '@/lib/html-parser';

interface JobContentProps {
  rawHtml: string;
  className?: string;
}

export function JobContent({ rawHtml, className = '' }: JobContentProps) {
  if (!rawHtml) {
    return (
      <div className={className}>
        <p className="text-gray-500 italic">No job description available.</p>
      </div>
    );
  }

  const parsedContent = parseJobDescription(rawHtml);
  const sections = extractJobSections(parsedContent);

  // Function to render formatted text content
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Split text into lines and process each line
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        // Empty line - add spacing
        elements.push(<br key={key++} />);
        continue;
      }

      // Check if line is a bullet point
      if (line.startsWith('• ')) {
        const bulletText = line.substring(2).trim();
        elements.push(
          <div key={key++} className="flex items-start mb-2">
            <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
            <span className="text-gray-700 leading-relaxed">{renderInlineFormatting(bulletText)}</span>
          </div>
        );
      }
      // Check if line is a header (starts with **)
      else if (line.startsWith('**') && line.endsWith('**')) {
        const headerText = line.slice(2, -2);
        elements.push(
          <h3 key={key++} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {headerText}
          </h3>
        );
      }
      // Regular paragraph text
      else {
        elements.push(
          <p key={key++} className="text-gray-700 leading-relaxed mb-4">
            {renderInlineFormatting(line)}
          </p>
        );
      }
    }

    return elements;
  };

  // Function to handle inline formatting (bold, italic)
  const renderInlineFormatting = (text: string): React.ReactNode => {
    if (!text) return text;

    // Split by bold markers (**text**)
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
      }
      
      // Check for italic markers (*text*)
      if (part.includes('*') && !part.startsWith('**')) {
        const italicParts = part.split(/(\*[^]+\*)/g);
        return italicParts.map((italicPart, italicIndex) => {
          if (italicPart.startsWith('*') && italicPart.endsWith('*') && !italicPart.startsWith('**')) {
            const italicText = italicPart.slice(1, -1);
            return <em key={`${index}-${italicIndex}`} className="italic">{italicText}</em>;
          }
          return italicPart;
        });
      }
      
      return part;
    });
  };

  // If we have structured sections, render them organized
  if (parsedContent.hasStructure && (sections.about || sections.responsibilities?.length || sections.requirements?.length)) {
    return (
      <div className={`prose max-w-none ${className}`}> 
        {sections.about && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About the Role</h3>
            <div className="text-gray-700 leading-relaxed">
              {renderFormattedText(sections.about)}
            </div>
          </div>
        )}

        {sections.responsibilities && sections.responsibilities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
            <div className="space-y-2">
              {sections.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-700 leading-relaxed">{responsibility}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.requirements && sections.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
            <div className="space-y-2">
              {sections.requirements.map((requirement, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-700 leading-relaxed">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.benefits && sections.benefits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
            <div className="space-y-2">
              {sections.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-600 mr-2 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-700 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.other && (
          <div className="mb-6">
            <div className="text-gray-700">
              {renderFormattedText(sections.other)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // If no clear structure, render the clean text with formatting
  return (
    <div className={`prose max-w-none ${className}`}> 
      <div className="text-gray-700">
        {renderFormattedText(parsedContent.cleanText)}
      </div>
    </div>
  );
}