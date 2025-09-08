'use client'

import React from 'react';
import { parseJobDescription, extractJobSections } from '@/lib/html-parser';

interface JobContentProps {
  rawHtml: string;
  className?: string;
}

export function JobContent({ rawHtml, className = '' }: JobContentProps) {
  if (!rawHtml) {
    return (
      <div className={className}>
        <p className="text-gray-400 italic">No job description available.</p>
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
            <span className="text-blue-400 mr-2 mt-1 flex-shrink-0">•</span>
            <span className="text-gray-300 leading-relaxed text-sm sm:text-base">{renderInlineFormatting(bulletText)}</span>
          </div>
        );
      }
      // Check if line is a header (starts with **)
      else if (line.startsWith('**') && line.endsWith('**')) {
        const headerText = line.slice(2, -2);
        elements.push(
          <h3 key={key++} className="text-base sm:text-lg font-semibold text-white mt-4 sm:mt-6 mb-2 sm:mb-3">
            {headerText}
          </h3>
        );
      }
      // Regular paragraph text
      else {
        elements.push(
          <p key={key++} className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
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
        return <strong key={index} className="font-semibold text-white">{boldText}</strong>;
      }
      
      // Check for italic markers (*text*)
      if (part.includes('*') && !part.startsWith('**')) {
        const italicParts = part.split(/(\*[^]+\*)/g);
        return italicParts.map((italicPart, italicIndex) => {
          if (italicPart.startsWith('*') && italicPart.endsWith('*') && !italicPart.startsWith('**')) {
            const italicText = italicPart.slice(1, -1);
            return <em key={`${index}-${italicIndex}`} className="italic text-gray-200">{italicText}</em>;
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
      <div className={`max-w-none ${className} [&_*]:text-gray-300`}> 
        {sections.about && (
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">About the Role</h3>
            <div className="text-gray-300 leading-relaxed text-sm sm:text-base">
              {renderFormattedText(sections.about)}
            </div>
          </div>
        )}

        {sections.responsibilities && sections.responsibilities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Responsibilities</h3>
            <div className="space-y-2">
              {sections.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-300 leading-relaxed text-sm sm:text-base">{responsibility}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.requirements && sections.requirements.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Requirements</h3>
            <div className="space-y-2">
              {sections.requirements.map((requirement, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-300 leading-relaxed text-sm sm:text-base">{requirement}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.benefits && sections.benefits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">Benefits</h3>
            <div className="space-y-2">
              {sections.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-emerald-400 mr-2 mt-1 flex-shrink-0">•</span>
                  <span className="text-gray-300 leading-relaxed text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {sections.other && (
          <div className="mb-6">
            <div className="text-gray-300 text-sm sm:text-base">
              {renderFormattedText(sections.other)}
            </div>
          </div>
        )}
      </div>
    );
  }

  // If no clear structure, render the clean text with formatting
  return (
    <div className={`max-w-none ${className}`}> 
      <div className="text-gray-300 text-sm sm:text-base [&_*]:text-gray-300">
        {renderFormattedText(parsedContent.cleanText)}
      </div>
    </div>
  );
}