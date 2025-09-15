import CustomizeFiltersButton from '../CustomizeFiltersButton';

export default function CustomizeFiltersButtonExample() {
  return (
    <div className="p-4 space-y-4">
      <CustomizeFiltersButton 
        onClick={() => console.log('Customize filters clicked')} 
        isOpen={false} 
      />
      <CustomizeFiltersButton 
        onClick={() => console.log('Customize filters clicked')} 
        isOpen={true} 
      />
    </div>
  );
}