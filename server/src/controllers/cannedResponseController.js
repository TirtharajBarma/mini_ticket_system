import prisma from '../config/database.js';

export const getCannedResponses = async (req, res) => {
  try {
    const responses = await prisma.cannedResponse.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ responses });
  } catch (error) {
    console.error('Get canned responses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCannedResponse = async (req, res) => {
  try {
    const { title, content } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can create canned responses' });
    }

    const response = await prisma.cannedResponse.create({
      data: { title, content }
    });

    res.status(201).json({
      message: 'Canned response created successfully',
      response
    });
  } catch (error) {
    console.error('Create canned response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCannedResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can update canned responses' });
    }

    const response = await prisma.cannedResponse.update({
      where: { id },
      data: { title, content }
    });

    res.json({
      message: 'Canned response updated successfully',
      response
    });
  } catch (error) {
    console.error('Update canned response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCannedResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({ error: 'Only admins can delete canned responses' });
    }

    await prisma.cannedResponse.delete({
      where: { id }
    });

    res.json({ message: 'Canned response deleted successfully' });
  } catch (error) {
    console.error('Delete canned response error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
