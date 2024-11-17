import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Picker } from "@react-native-picker/picker";

interface FormData {
  division: string;
  district: string;
  upazila: string;
  union: string;
  mouzaName: string;
  surveyType: string;
  sheetNumber: string;
}

const FormScreen: React.FC = () => {
  const { control, handleSubmit, setValue, getValues } = useForm<FormData>({
    defaultValues: {
      division: "",
      district: "",
      upazila: "",
      union: "",
      mouzaName: "",
      surveyType: "",
      sheetNumber: "",
    },
  });

  const [divisions, setDivisions] = useState<Array<string>>([]);
  const [districts, setDistricts] = useState<Array<string>>([]);
  const [upazilas, setUpazilas] = useState<Array<string>>([]);
  const [mouzaFields, setMouzaFields] = useState<Array<FormData>>([]);
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // Static list of survey types
  const staticSurveyTypes = [
    "Land Survey",
    "Population Survey",
    "Agriculture Survey",
    "Economic Survey",
    "Census Survey",
  ];

  useEffect(() => {
    fetch("https://bdapis.com/api/v1.2/divisions")
      .then((response) => response.json())
      .then((data) => {
        const divisionsList = data.data.map(
          (item: { division: string }) => item.division
        );
        setDivisions(divisionsList);
      })
      .catch((error) => {
        console.error("Error fetching divisions:", error);
      });
  }, []);

  // Fetch districts based on selected division
  useEffect(() => {
    if (selectedDivision) {
      fetch(`https://bdapis.com/api/v1.2/division/${selectedDivision}`)
        .then((response) => response.json())
        .then((data) => {
          const districtList = data.data.map(
            (item: { district: string }) => item.district
          );
          setDistricts(districtList);
        })
        .catch((error) => {
          console.error("Error fetching districts:", error);
        });
    }
  }, [selectedDivision]);

  // Fetch upazilas based on selected district
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://bdapis.com/api/v1.2/district/${selectedDistrict}`)
        .then((response) => response.json())
        .then((data) => {
          const upazilasList = data.data[0]?.upazillas || [];
          setUpazilas(upazilasList);
        })
        .catch((error) => {
          console.error("Error fetching upazilas:", error);
        });
    }
  }, [selectedDistrict]);

  const onSubmit = async (data: FormData) => {
    const mouzaData = mouzaFields.map((_, index) => ({
      mouzaName: getValues(`mouzaName_${index}`),
      surveyType: getValues(`surveyType_${index}`),
      sheetNumber: getValues(`sheetNumber_${index}`),
    }));

    const requestData = {
      division: data.division,
      district: data.district,
      upazila: data.upazila,
      union: data.union,
      mouzaData: mouzaData,
    };

    try {
      const response = await fetch("http://localhost:3000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        alert("Error submitting form: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  const handleAddMouza = () => {
    setMouzaFields([
      ...mouzaFields,
      {
        mouzaName: "",
        surveyType: "",
        sheetNumber: "",
        division: "",
        district: "",
        upazila: "",
        union: "",
      },
    ]);
  };

  const handleRemoveMouza = (index: number) => {
    const newMouzaFields = [...mouzaFields];
    newMouzaFields.splice(index, 1);
    setMouzaFields(newMouzaFields);
  };

  return (
    <View style={styles.container}>
      <Text>Division</Text>
      <Controller
        control={control}
        name="division"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              onChange(itemValue);
              setSelectedDivision(itemValue);
              setSelectedDistrict("");
            }}
            style={styles.input}
          >
            <Picker.Item label="Select Division" value="" />
            {divisions.map((division, index) => (
              <Picker.Item
                key={index}
                label={division}
                value={division.toLowerCase()}
              />
            ))}
          </Picker>
        )}
      />

      <Text>District</Text>
      <Controller
        control={control}
        name="district"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              onChange(itemValue);
              setSelectedDistrict(itemValue);
            }}
            style={styles.input}
          >
            <Picker.Item label="Select District" value="" />
            {districts.map((district, index) => (
              <Picker.Item
                key={index}
                label={district}
                value={district.toLowerCase()}
              />
            ))}
          </Picker>
        )}
      />

      <Text>Upazila</Text>
      <Controller
        control={control}
        name="upazila"
        render={({ field: { onChange, value } }) => (
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            style={styles.input}
          >
            <Picker.Item label="Select Upazila" value="" />
            {upazilas.map((upazila, index) => (
              <Picker.Item
                key={index}
                label={upazila}
                value={upazila.toLowerCase()}
              />
            ))}
          </Picker>
        )}
      />

      <Text>Union</Text>
      <Controller
        control={control}
        name="union"
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={styles.input}
            onChangeText={onChange}
            value={value}
            placeholder="Enter Union"
          />
        )}
      />

      <View style={styles.mouzaSection}>
        <Text style={styles.title}>Mouza Information</Text>
        <TouchableOpacity onPress={handleAddMouza} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {mouzaFields.map((_, index) => (
        <View key={index} style={styles.mouzaField}>
          <Text>Name of Mouza</Text>
          <Controller
            control={control}
            name={`mouzaName_${index}`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                value={value}
                placeholder="Enter Mouza Name"
              />
            )}
          />

          <Text>Survey Types</Text>
          <Controller
            control={control}
            name={`surveyType_${index}`}
            render={({ field: { onChange, value } }) => (
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.input}
              >
                <Picker.Item label="Select Survey Type" value="" />
                {staticSurveyTypes.map((surveyType, index) => (
                  <Picker.Item
                    key={index}
                    label={surveyType}
                    value={surveyType}
                  />
                ))}
              </Picker>
            )}
          />

          <Text>Sheet Number</Text>
          <Controller
            control={control}
            name={`sheetNumber_${index}`}
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={styles.input}
                onChangeText={onChange}
                value={value}
                placeholder="Enter Sheet Number"
              />
            )}
          />

          <TouchableOpacity
            onPress={() => handleRemoveMouza(index)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>Remove Mouza</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  mouzaSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#008E86",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mouzaField: {
    marginBottom: 20,
  },
  removeButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default FormScreen;
