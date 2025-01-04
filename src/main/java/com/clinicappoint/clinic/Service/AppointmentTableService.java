package com.clinicappoint.clinic.Service;

import com.clinicappoint.clinic.Entity.Appointment;

import java.util.List;

public interface AppointmentTableService {
    public List<Appointment> getAppointmentTableByDate(String date);

    public void postAppointment(String date,String doctorName,int Hourindex,int Minuteindex,String attribute
    ,String type, String phonenumber,String name,String membership,String appointmentStartTime,int appointmentStartHourindex,
    int appointmentStartMinutesindex,int appointmentEndHourindex,int appointmentEndMinutesindex,String appointmentEndTime,
                                int appointmentcost  );

    public void deleteAppointment(String date,String doctorName,int Hourindex,int Minuteindex);
    public List<Appointment> mergeAppointment(List<Appointment> appointmentList);
    public void updateInstruction(int Starthourindex, int Endhourindex, int StartMinuteindex, int EndMinuteindex, String date, String doctor,String instruction);
    public void updateload(int Starthourindex,int Endhourindex,int StartMinuteindex,int EndMinuteindex,String date,String doctor);

    public void updateClinic(int Starthourindex, int Endhourindex, int StartMinuteindex, int EndMinuteindex, String date, String doctor,String instruction);
}

