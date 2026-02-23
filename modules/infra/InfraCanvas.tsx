'use client';

import { useState, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Text, Group, Arrow } from 'react-konva';

interface CanvasProps {
    elements: any[];
    setElements: (elements: any[]) => void;
    selectedTool: string;
}

export default function InfraCanvas({ elements, setElements, selectedTool }: CanvasProps) {
    const [isDrawing, setIsDrawing] = useState(false);
    const stageRef = useRef<any>(null);

    const handleDragEnd = (e: any, id: string) => {
        setElements(elements.map(el => {
            if (el.id === id) {
                return { ...el, x: e.target.x(), y: e.target.y() };
            }
            return el;
        }));
    };

    const handleMouseDown = (e: any) => {
        if (selectedTool !== 'arrow') return;

        const pos = e.target.getStage().getPointerPosition();
        // Adjust position based on stage scale/offset if needed, but keeping it simple for now
        const stage = e.target.getStage();
        const offsetX = stage.x();
        const offsetY = stage.y();

        setIsDrawing(true);
        const newArrow = {
            id: Date.now().toString(),
            type: 'arrow',
            points: [(pos.x - offsetX), (pos.y - offsetY), (pos.x - offsetX), (pos.y - offsetY)],
            fill: 'var(--accent-primary)',
            stroke: 'var(--accent-primary)',
        };
        setElements([...elements, newArrow]);
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing || selectedTool !== 'arrow') return;

        const stage = e.target.getStage();
        const pos = stage.getPointerPosition();
        const offsetX = stage.x();
        const offsetY = stage.y();

        const lastArrow = elements[elements.length - 1];
        const updatedArrow = {
            ...lastArrow,
            points: [lastArrow.points[0], lastArrow.points[1], (pos.x - offsetX), (pos.y - offsetY)],
        };

        const newElements = elements.slice(0, elements.length - 1).concat([updatedArrow]);
        setElements(newElements);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth - 320}
            height={window.innerHeight - 200}
            draggable={selectedTool === 'hand'}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <Layer>
                {elements.map((el) => {
                    if (el.type === 'arrow') {
                        return (
                            <Arrow
                                key={el.id}
                                points={el.points}
                                stroke={el.stroke}
                                fill={el.fill}
                                strokeWidth={2}
                                pointerLength={10}
                                pointerWidth={10}
                                lineCap="round"
                                lineJoin="round"
                                draggable={selectedTool === 'select'}
                                onDragEnd={(e) => {
                                    const newPoints = [...el.points];
                                    // This is a bit complex for arrows, simple move of entire arrow:
                                    const dx = e.target.x();
                                    const dy = e.target.y();
                                    // Reset target pos to 0,0 and update points instead
                                    e.target.x(0);
                                    e.target.y(0);
                                    setElements(elements.map(item => {
                                        if (item.id === el.id) {
                                            return {
                                                ...item,
                                                points: [item.points[0] + dx, item.points[1] + dy, item.points[2] + dx, item.points[3] + dy]
                                            };
                                        }
                                        return item;
                                    }));
                                }}
                            />
                        );
                    }
                    return (
                        <Group
                            key={el.id}
                            x={el.x}
                            y={el.y}
                            draggable={selectedTool === 'select'}
                            onDragEnd={(e) => handleDragEnd(e, el.id)}
                        >
                            {(el.type === 'rect' || el.type === 'server' || el.type === 'firewall' || el.type === 'switch') && (
                                <Rect
                                    width={el.width}
                                    height={el.height}
                                    fill={el.fill}
                                    cornerRadius={12}
                                    shadowBlur={15}
                                    shadowOpacity={0.3}
                                    shadowColor="rgba(0, 0, 0, 0.5)"
                                    stroke="rgba(255, 255, 255, 0.1)"
                                    strokeWidth={1}
                                />
                            )}
                            {(el.type === 'circle' || el.type === 'cloud') && (
                                <Circle
                                    radius={el.width / 2}
                                    fill={el.fill}
                                    shadowBlur={15}
                                    shadowOpacity={0.3}
                                    shadowColor="rgba(0, 0, 0, 0.5)"
                                    stroke="rgba(255, 255, 255, 0.1)"
                                    strokeWidth={1}
                                />
                            )}
                            <Text
                                text={el.text}
                                fontSize={12}
                                fontStyle="bold"
                                fill="#fff"
                                align="center"
                                verticalAlign="middle"
                                width={el.width}
                                height={el.height}
                                padding={10}
                            />
                        </Group>
                    );
                })}
            </Layer>
        </Stage>
    );
}
