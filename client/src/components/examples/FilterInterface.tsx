import { useState } from 'react';
import FilterInterface from '../FilterInterface';
import { ColumnConfig, defaultColumns } from '../ExecutionsTable';
import { SavedFilter } from '@/types/savedFilters';

const mockActiveFilters = [
  { id: 'scope', label: 'Scope', value: 'User' },
  { id: 'interval', label: 'Interval', value: 'Last 7 Days' },
];

export default function FilterInterfaceExample() {
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState(mockActiveFilters);
  const [showChart, setShowChart] = useState(false);
  const [periodicRefresh, setPeriodicRefresh] = useState(true);
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [statesOperator, setStatesOperator] = useState('in');
  const [selectedInterval, setSelectedInterval] = useState('last-7-days');
  const [intervalStartDate, setIntervalStartDate] = useState<string | undefined>();
  const [intervalEndDate, setIntervalEndDate] = useState<string | undefined>();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [labelsOperator, setLabelsOperator] = useState('has-any-of');
  const [labelsCustomValue, setLabelsCustomValue] = useState('');
  const [selectedInputs, setSelectedInputs] = useState<string[]>([]);
  const [inputsOperator, setInputsOperator] = useState('has-any-of');
  const [inputsCustomValue, setInputsCustomValue] = useState('');
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);
  const [outputsOperator, setOutputsOperator] = useState('has-any-of');
  const [outputsCustomValue, setOutputsCustomValue] = useState('');
  const [selectedNamespaces, setSelectedNamespaces] = useState<string[]>([]);
  const [namespaceOperator, setNamespaceOperator] = useState('in');
  const [namespaceCustomValue, setNamespaceCustomValue] = useState('');
  const [selectedFlows, setSelectedFlows] = useState<string[]>([]);
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['user']);
  const [selectedKinds, setSelectedKinds] = useState<string[]>(['default']);
  const [selectedHierarchy, setSelectedHierarchy] = useState<string>('all');
  const [selectedInitialExecution, setSelectedInitialExecution] = useState('');
  const [visibleFilters, setVisibleFilters] = useState<string[]>(['scope', 'kind', 'hierarchy', 'interval']);

  const savedFilters: SavedFilter[] = [];

  const handleClearFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const handleEditFilter = (filterId: string) => {
    console.log(`Editing filter: ${filterId}`);
  };

  const handleResetFilters = () => {
    setActiveFilters(mockActiveFilters);
    setVisibleFilters(['scope', 'kind', 'hierarchy', 'interval']);
  };

  const handleIntervalChange = (interval: string, start?: string, end?: string) => {
    setSelectedInterval(interval);
    setIntervalStartDate(start);
    setIntervalEndDate(end);
  };

  return (
    <div className="w-full border rounded-md">
      <FilterInterface
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        activeFilters={activeFilters}
        onClearFilter={handleClearFilter}
        onEditFilter={handleEditFilter}
        onResetFilters={handleResetFilters}
        showChart={showChart}
        onToggleShowChart={setShowChart}
        periodicRefresh={periodicRefresh}
        onTogglePeriodicRefresh={setPeriodicRefresh}
        onRefreshData={() => console.log('Refreshing data...')}
        columns={columns}
        onColumnsChange={setColumns}
        selectedStates={selectedStates}
        statesOperator={statesOperator}
        onSelectedStatesChange={setSelectedStates}
        onStatesOperatorChange={setStatesOperator}
        selectedInterval={selectedInterval}
        intervalStartDate={intervalStartDate}
        intervalEndDate={intervalEndDate}
        onIntervalChange={handleIntervalChange}
        selectedLabels={selectedLabels}
        labelsOperator={labelsOperator}
        labelsCustomValue={labelsCustomValue}
        onLabelsSelectionChange={setSelectedLabels}
        onLabelsOperatorChange={setLabelsOperator}
        onLabelsCustomValueChange={setLabelsCustomValue}
        selectedInputs={selectedInputs}
        inputsOperator={inputsOperator}
        inputsCustomValue={inputsCustomValue}
        onInputsSelectionChange={setSelectedInputs}
        onInputsOperatorChange={setInputsOperator}
        onInputsCustomValueChange={setInputsCustomValue}
        selectedOutputs={selectedOutputs}
        outputsOperator={outputsOperator}
        outputsCustomValue={outputsCustomValue}
        onOutputsSelectionChange={setSelectedOutputs}
        onOutputsOperatorChange={setOutputsOperator}
        onOutputsCustomValueChange={setOutputsCustomValue}
        selectedNamespaces={selectedNamespaces}
        namespaceOperator={namespaceOperator}
        namespaceCustomValue={namespaceCustomValue}
        onNamespacesSelectionChange={setSelectedNamespaces}
        onNamespaceOperatorChange={setNamespaceOperator}
        onNamespaceCustomValueChange={setNamespaceCustomValue}
        selectedFlows={selectedFlows}
        onFlowsSelectionChange={setSelectedFlows}
        selectedScopes={selectedScopes}
        onScopesSelectionChange={setSelectedScopes}
        selectedKinds={selectedKinds}
        onKindsSelectionChange={setSelectedKinds}
        selectedHierarchy={selectedHierarchy}
        onHierarchySelectionChange={setSelectedHierarchy}
        selectedInitialExecution={selectedInitialExecution}
        onInitialExecutionSelectionChange={setSelectedInitialExecution}
        savedFilters={savedFilters}
        onSaveFilter={(name, description) => console.log('Save filter', name, description)}
        onLoadFilter={(filter) => console.log('Load filter', filter.id)}
        onDeleteFilter={(id) => console.log('Delete filter', id)}
        onUpdateFilter={(id, name, description) => console.log('Update filter', id, name, description)}
        visibleFilters={visibleFilters}
        onVisibleFiltersChange={setVisibleFilters}
        onResetFilter={(id) => console.log('Reset filter', id)}
      />
    </div>
  );
}
