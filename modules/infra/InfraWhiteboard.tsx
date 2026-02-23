import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import {
    MousePointer2,
    Move,
    ArrowUpRight,
    Square,
    Circle,
    Type,
    Plus,
    Save,
    Trash2,
    ZoomIn,
    ZoomOut,
    Server,
    Shield,
    Cloud,
    Network,
    Loader2,
    Undo2,
    Layout,
    HandIcon
} from 'lucide-react';
import styles from './InfraWhiteboard.module.css';

// Dynamic Konva component to prevent SSR issues
const Canvas = dynamic(() => import('./InfraCanvas'), {
    ssr: false,
    loading: () => (
        <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} />
            <span>Carregando Infraestrutura...</span>
        </div>
    )
});

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function InfraWhiteboard() {
    const { data: diagrams, mutate } = useSWR('/api/infra', fetcher);
    const [elements, setElements] = useState<any[]>([]);
    const [selectedTool, setSelectedTool] = useState('select');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (diagrams?.[0]?.data) {
            try {
                const data = JSON.parse(diagrams[0].data);
                if (Array.isArray(data)) setElements(data);
            } catch (e) {
                console.error("Error parsing diagram", e);
            }
        }
    }, [diagrams]);

    const addElement = (type: string) => {
        const newElement = {
            id: Date.now().toString(),
            type,
            x: 100,
            y: 100,
            width: 140,
            height: 90,
            fill: 'var(--accent-primary)',
            text: type.toUpperCase(),
        };
        setElements([...elements, newElement]);
    };

    const saveDiagram = async () => {
        setIsSaving(true);
        try {
            await fetch('/api/infra', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: diagrams?.[0]?.id,
                    name: 'Diagrama Principal',
                    data: JSON.stringify(elements)
                })
            });
            await mutate();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.info}>
                    <h2 className={styles.title}>Mapa de Infraestrutura</h2>
                    <p className={styles.subtitle}>Desenhe e conecte sua infraestrutura interna</p>
                </div>
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => setElements([])}>
                        <Undo2 size={18} /> Limpar
                    </button>
                    <button className={`${styles.actionBtn} ${styles.primary}`} onClick={saveDiagram} disabled={isSaving}>
                        {isSaving ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
                        Salvar Mapa
                    </button>
                </div>
            </div>

            <div className={styles.workspace}>
                <div className={styles.sideToolbar}>
                    <div className={styles.toolGroup}>
                        <button
                            className={`${styles.tool} ${selectedTool === 'select' ? styles.toolActive : ''}`}
                            onClick={() => setSelectedTool('select')}
                            title="Selecionar"
                        >
                            <MousePointer2 size={20} />
                        </button>
                        <button
                            className={`${styles.tool} ${selectedTool === 'hand' ? styles.toolActive : ''}`}
                            onClick={() => setSelectedTool('hand')}
                            title="Mão (Mover Mapa)"
                        >
                            <HandIcon size={20} />
                        </button>
                        <button
                            className={`${styles.tool} ${selectedTool === 'arrow' ? styles.toolActive : ''}`}
                            onClick={() => setSelectedTool('arrow')}
                            title="Seta (Conexão)"
                        >
                            <ArrowUpRight size={20} />
                        </button>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.toolGroup}>
                        <button className={styles.tool} onClick={() => addElement('server')} title="Servidor"><Server size={20} /></button>
                        <button className={styles.tool} onClick={() => addElement('firewall')} title="Firewall"><Shield size={20} /></button>
                        <button className={styles.tool} onClick={() => addElement('switch')} title="Switch"><Network size={20} /></button>
                        <button className={styles.tool} onClick={() => addElement('cloud')} title="Cloud"><Cloud size={20} /></button>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.toolGroup}>
                        <button className={styles.tool} onClick={() => addElement('rect')} title="Bloco"><Layout size={20} /></button>
                        <button className={styles.tool} onClick={() => addElement('text')} title="Texto"><Type size={20} /></button>
                    </div>
                </div>

                <div className={styles.canvasContainer} data-tool={selectedTool}>
                    <Canvas
                        elements={elements}
                        setElements={setElements}
                        selectedTool={selectedTool}
                    />
                </div>
            </div>
        </div>
    );
}
