import { Hono } from 'hono';
import { sValidator } from '@hono/standard-validator';
import {
  PatientIdSchema,
  PatientRequestSchema,
  PatientResponseSchema,
} from './schemas';
import { BadRequestException, NotFoundException } from '@pms/middlewares';
import {
  createPatient,
  deletePatient,
  getAllPatients,
  getPatientByEmail,
  getPatientById,
  isEmailTakenByAnotherPatient,
  updatePatient,
} from './queries';
import { publish } from '@pms/pubsub';

const router = new Hono();

// get patients
router.get('/', async (c) => {
  const patients = await getAllPatients();

  return c.json({
    status: 'success',
    data: {
      patients: patients.map((patient) => PatientResponseSchema.parse(patient)),
    },
  });
});

// get patient
router.get('/:patientId', sValidator('param', PatientIdSchema), async (c) => {
  const { patientId } = c.req.valid('param');
  const patient = await getPatientById(patientId);

  if (!patient) {
    throw new NotFoundException('Patient not found');
  }

  return c.json({
    status: 'success',
    data: { patient: PatientResponseSchema.parse(patient) },
  });
});

// create patient
router.post('/', sValidator('json', PatientRequestSchema), async (c) => {
  const data = c.req.valid('json');

  const existing = await getPatientByEmail(data.email);

  if (existing) {
    throw new BadRequestException('Patient already exist with this email');
  }

  const created = await createPatient(data);
  await publish('user.created', created);

  return c.json(
    {
      status: 'success',
      data: {
        patient: PatientResponseSchema.parse(created),
      },
    },
    201
  );
});

// update patient
router.patch(
  '/:patientId',
  sValidator('param', PatientIdSchema),
  sValidator('json', PatientRequestSchema),
  async (c) => {
    const { patientId } = c.req.valid('param');
    const data = c.req.valid('json');

    const existing = await getPatientById(patientId);

    if (!existing) {
      throw new NotFoundException('Patient not found');
    }

    if (data.email) {
      const conflict = await isEmailTakenByAnotherPatient(
        data.email,
        patientId
      );

      if (conflict) throw new BadRequestException('Email already taken');
    }

    const updated = await updatePatient(patientId, data);
    await publish('user.updated', updated);

    return c.json({
      status: 'success',
      data: {
        patient: PatientResponseSchema.parse(updated),
      },
    });
  }
);

// delete patient
router.delete(
  '/:patientId',
  sValidator('param', PatientIdSchema),
  async (c) => {
    const { patientId } = c.req.valid('param');

    const patient = await getPatientById(patientId);

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    await deletePatient(patientId);
    await publish('user.deleted', patient);

    return c.json({ status: 'success' });
  }
);

export { router };
