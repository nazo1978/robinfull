'use client';

import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheck } from 'react-icons/fi';

interface NumberSelectorProps {
  numbersPerTicket: number;
  allowCustomNumbers: boolean;
  onNumbersChange: (numbers: string[]) => void;
  selectedNumbers: string[];
}

export default function NumberSelector({ 
  numbersPerTicket, 
  allowCustomNumbers, 
  onNumbersChange, 
  selectedNumbers 
}: NumberSelectorProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customNumbers, setCustomNumbers] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<string[]>(Array(numbersPerTicket).fill(''));

  useEffect(() => {
    if (selectedNumbers.length > 0) {
      setCustomNumbers(selectedNumbers);
      setInputValues(selectedNumbers);
      setIsCustomMode(true);
    } else {
      generateRandomNumbers();
    }
  }, [numbersPerTicket]);

  const generateRandomNumbers = () => {
    const numbers: string[] = [];
    const usedNumbers = new Set<string>();

    while (numbers.length < numbersPerTicket) {
      const randomNum = Math.floor(Math.random() * 1000);
      const formattedNum = randomNum.toString().padStart(3, '0');

      if (!usedNumbers.has(formattedNum)) {
        // Minimum 4 sayı farkı kontrolü
        let isValid = true;
        for (const existingNum of numbers) {
          const diff = Math.abs(parseInt(formattedNum) - parseInt(existingNum));
          if (diff < 4) {
            isValid = false;
            break;
          }
        }

        if (isValid) {
          numbers.push(formattedNum);
          usedNumbers.add(formattedNum);
        }
      }
    }

    const sortedNumbers = numbers.sort((a, b) => parseInt(a) - parseInt(b));
    onNumbersChange(sortedNumbers);
    
    if (isCustomMode) {
      setCustomNumbers(sortedNumbers);
      setInputValues(sortedNumbers);
    }
  };

  const handleCustomNumberChange = (index: number, value: string) => {
    // Sadece sayı girişine izin ver
    const numericValue = value.replace(/\D/g, '');
    
    // Maksimum 3 karakter
    const limitedValue = numericValue.slice(0, 3);
    
    const newInputValues = [...inputValues];
    newInputValues[index] = limitedValue;
    setInputValues(newInputValues);

    // Tüm alanlar dolduysa ve geçerliyse güncelle
    if (newInputValues.every(val => val.length === 3)) {
      const formattedNumbers = newInputValues.map(val => val.padStart(3, '0'));
      
      // Benzersizlik kontrolü
      const uniqueNumbers = new Set(formattedNumbers);
      if (uniqueNumbers.size === formattedNumbers.length) {
        const sortedNumbers = formattedNumbers.sort((a, b) => parseInt(a) - parseInt(b));
        setCustomNumbers(sortedNumbers);
        onNumbersChange(sortedNumbers);
      }
    }
  };

  const handleModeToggle = () => {
    if (!allowCustomNumbers) return;
    
    if (isCustomMode) {
      // Otomatik moda geç
      setIsCustomMode(false);
      generateRandomNumbers();
    } else {
      // Özel mod'a geç
      setIsCustomMode(true);
      setInputValues(Array(numbersPerTicket).fill(''));
      setCustomNumbers([]);
      onNumbersChange([]);
    }
  };

  const isValidSelection = () => {
    if (!isCustomMode) return true;
    
    if (customNumbers.length !== numbersPerTicket) return false;
    
    // Benzersizlik kontrolü
    const uniqueNumbers = new Set(customNumbers);
    return uniqueNumbers.size === customNumbers.length;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Bilet Sayıları ({numbersPerTicket} Sayı)
        </h3>
        
        {allowCustomNumbers && (
          <div className="flex items-center gap-2">
            <button
              onClick={generateRandomNumbers}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Yenile
            </button>
            
            <button
              onClick={handleModeToggle}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                isCustomMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {isCustomMode ? 'Otomatik' : 'Özel Seç'}
            </button>
          </div>
        )}
      </div>

      {isCustomMode && allowCustomNumbers ? (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Kendi sayılarınızı seçin (000-999 arası, 3 haneli)
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {Array.from({ length: numbersPerTicket }, (_, index) => (
              <div key={index} className="relative">
                <input
                  type="text"
                  value={inputValues[index]}
                  onChange={(e) => handleCustomNumberChange(index, e.target.value)}
                  placeholder="000"
                  maxLength={3}
                  className="w-full px-3 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                {inputValues[index].length === 3 && (
                  <FiCheck className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>
            ))}
          </div>

          {!isValidSelection() && customNumbers.length > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Tüm sayılar benzersiz olmalı ve {numbersPerTicket} adet olmalıdır.
            </p>
          )}
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Otomatik oluşturulan sayılar
          </p>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(isCustomMode ? customNumbers : selectedNumbers).map((number, index) => (
              <div
                key={index}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-md text-center font-mono font-semibold"
              >
                {number}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedNumbers.length === 0 && isCustomMode && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Sayılarınızı seçin
          </p>
        </div>
      )}
    </div>
  );
}
