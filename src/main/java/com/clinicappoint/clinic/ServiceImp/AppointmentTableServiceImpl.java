package com.clinicappoint.clinic.ServiceImp;

import com.clinicappoint.clinic.Entity.Appointment;
import com.clinicappoint.clinic.Entity.DoctorEntity;
import com.clinicappoint.clinic.Repository.AppointmentRepository;
import com.clinicappoint.clinic.Repository.DoctorRepository;
import com.clinicappoint.clinic.Service.AppointmentTableService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class AppointmentTableServiceImpl implements AppointmentTableService {
    @Autowired
    AppointmentRepository appointmentRepository;

    @Autowired
    DoctorRepository doctorRepository;

    @Override
    public List<Appointment> getAppointmentTableByDate(String date) {
        List<Appointment> test = appointmentRepository.findAppointmentByDate(date);
        List<Appointment> TEST = mergeAppointment(test);
        return appointmentRepository.findAppointmentByDate(date);
    }

    @Override
    @Transactional
    public void postAppointment(String date, String doctorName, int Hourindex, int Minuteindex, String attribute
            , String type, String phonenumber, String name, String membership, String appointmentStartTime, int appointmentStartHourindex,
                                int appointmentStartMinutesindex, int appointmentEndHourindex, int appointmentEndMinutesindex, String appointmentEndTime,
                                int appointmentcost) {
        Appointment appointment = new Appointment();
        //   DoctorEntity doctorEntity=doctorRepository.getDoctorEntityByName(doctorName);
        if (((Hourindex > appointmentStartHourindex) || (Hourindex == appointmentStartHourindex) && (Minuteindex >= appointmentStartMinutesindex)) &&
                ((Hourindex < appointmentEndHourindex) || (Hourindex == appointmentEndHourindex) && (Minuteindex <= appointmentEndMinutesindex))) {

        }

        if (appointmentRepository.findAppointmentByIndex(date, doctorName, Hourindex, Minuteindex) != null) {
            appointment = appointmentRepository.findAppointmentByIndex(date, doctorName, Hourindex, Minuteindex);
            appointment.setAttribute(attribute);
            if (attribute.equals("已付费")) {
                Date date1 = new Date();
                appointment.setCashDate(date1);
            }
            appointmentRepository.save(appointment);
        } else {
            appointment.setDate(date);
            appointment.setHourindex(Hourindex);
            appointment.setDoctor(doctorName);
            appointment.setMinuteindex(Minuteindex);
            appointment.setAttribute(attribute);
            appointment.setType(type);
            appointment.setPhonenumber(phonenumber);
            appointment.setName(name);
            appointment.setMembership(membership);
            appointment.setAppointmentStartTime(appointmentStartTime);
            appointment.setAppointmentStartHourindex(appointmentStartHourindex);
            appointment.setAppointmentStartMinutesindex(appointmentStartMinutesindex);
            appointment.setAppointmentEndHourindex(appointmentEndHourindex);
            appointment.setAppointmentEndMinutesindex(appointmentEndMinutesindex);
            appointment.setAppointmentEndTime(appointmentEndTime);
            appointment.setAppointmentcost(appointmentcost);
            appointmentRepository.save(appointment);
        }
//            return;
    }

    @Override
    public void deleteAppointment(String date, String doctorName, int Hourindex, int Minuteindex) {
        Appointment appointment = new Appointment();
        appointment = appointmentRepository.findAppointmentByIndex(date, doctorName, Hourindex, Minuteindex);
        appointmentRepository.delete(appointment);

    }

    @Override
    public List<Appointment> mergeAppointment(List<Appointment> appointmentList) {
        if (appointmentList.isEmpty()) {
            return null;
        }
        int starthourindex = appointmentList.get(0).getAppointmentStartHourindex();
        int startminuteindex = appointmentList.get(0).getAppointmentStartMinutesindex();
        int endhourindex = appointmentList.get(0).getAppointmentEndHourindex();
        int endminuteindex = appointmentList.get(0).getAppointmentEndMinutesindex();
        String date = appointmentList.get(0).getDate();
        String doctorName = appointmentList.get(0).getDoctor();
        List<Appointment> returnlist = new ArrayList<>();
        returnlist.add(appointmentList.get(0));
        for (Appointment appointment : appointmentList) {
            if (appointment.getAppointmentStartHourindex() == starthourindex &&
                    appointment.getAppointmentEndHourindex() == endhourindex &&
                    appointment.getAppointmentEndMinutesindex() == endminuteindex &&
                    appointment.getAppointmentStartMinutesindex() == startminuteindex &&
                    appointment.getDoctor().equals(doctorName) &&
                    appointment.getDate().equals(date)) {
                continue;
            } else {
                returnlist.add(appointment);
                starthourindex = appointment.getAppointmentStartHourindex();
                startminuteindex = appointment.getAppointmentStartMinutesindex();
                endhourindex = appointment.getAppointmentEndHourindex();
                endminuteindex = appointment.getAppointmentEndMinutesindex();
                doctorName = appointment.getDoctor();
                date = appointment.getDate();
            }
        }
        return returnlist;
    }

    @Override
    public void updateload(int Starthourindex, int Endhourindex, int StartMinuteindex, int EndMinuteindex, String date, String doctor) {
        List<Appointment> update = appointmentRepository.findAll();
        List<Appointment> result = new ArrayList<>();
        for (Appointment appointment : update) {
            if (((appointment.getAppointmentStartHourindex()> Starthourindex) || (appointment.getAppointmentStartHourindex() == Starthourindex) &&
                    (appointment.getAppointmentStartMinutesindex() >= StartMinuteindex)) &&
                    ((appointment.getAppointmentEndHourindex() < Endhourindex) || (appointment.getAppointmentEndHourindex() ==
                            Endhourindex) && (appointment.getAppointmentEndMinutesindex() <= EndMinuteindex))){
                appointment.setAttribute("已付费");
                Date now=new Date();
                appointment.setCashDate(now);
                appointmentRepository.save(appointment);
            }
        }
    }


}
